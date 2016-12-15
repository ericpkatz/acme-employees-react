import React, { Component} from 'react';
import { Router, Route, hashHistory, IndexRoute, Link } from 'react-router';
import { render } from 'react-dom';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import $ from 'jquery';
import { Provider, connect } from 'react-redux';

const EmployeesReducer = (state=[], action) => {
  switch(action.type){
    case 'LOAD_EMPLOYEES':
      return action.employees;
      break;
    case 'ADD_EMPLOYEE':
      return [ ...state, action.employee ];
      break;
    case 'DELETE_EMPLOYEE':
      console.log('sync delete');
      var state = state.filter( employee => employee.id !== action.employee.id);
      console.log(state);
      return state;
      break;
    default:
      return state;
  }
}; 

const getEmployeesFromServer = () => {
  return (dispatch)=> {
    $.get('/api/employees')
      .then( (employees)=> {
        dispatch({ type: 'LOAD_EMPLOYEES', employees: employees });
      });
  }
}

const deleteEmployeeFromServer = (employee) => {
  return (dispatch)=> {
    $.ajax({
      url: '/api/employees/' + employee.id,
      type: 'DELETE',
      success: ()=> {
        dispatch({ type: 'DELETE_EMPLOYEE', employee: employee });
      }
    });
  }
}

const getEmployeeFromServer = (id) => {
  return (dispatch)=> {
    $.get('/api/employees/' + id)
      .then( (employee)=> {
        dispatch({ type: 'ADD_EMPLOYEE', employee: employee });
      });
  }
}

const reset = (id) => {
  return (dispatch)=> {
    $.get('/api/employees/reset')
      .then( (employee)=> {
        dispatch(getEmployeesFromServer());
      });
  }
}
const rootReducer = combineReducers({
  employees: EmployeesReducer
});
const store = createStore(rootReducer, applyMiddleware(thunk));
//store.dispatch({ type: 'ADD_EMPLOYEE', employee: { id: 3, name: 'Curly' }});
//store.dispatch({ type: 'LOAD_EMPLOYEES', employees: []});

const Layout = ({ children })=> {
  return (
      <div className='container'>
        <h1>Acme Employees</h1>
        <ul className='nav nav-tabs'>
          <li>
            <Link to='home'>Home</Link> 
          </li>
          <li>
            <Link to='employees'>Employees</Link> 
          </li>
        </ul>
        { children } 
      </div>
  );
};

const Home = ()=> {
  return (
      <div className='well'>
      Home
      </div>
  );
};

class Employees extends Component{
  constructor(props){
    super(props);
    this.dispatch = props.dispatch;
  }
  componentDidMount(){
    this.dispatch(getEmployeesFromServer());
  }
  render(){
    if(!this.props.employees){
      return (<div></div>);
    }
    return (
        <div className='well'>
        Employees { this.props.employees.length } 
        <a onClick={ ()=> this.props.dispatch(reset()) }>Reset</a>
        <ul>
        {
          this.props.employees.map( employee => {
            return (
                <li key={ employee.id }>
                  <a onClick={ ()=> this.props.dispatch(deleteEmployeeFromServer(employee)) }>
                    Delete
                  </a>
                  <Link to={ `employees/${employee.id}`}>
                    { employee.name }
                  </Link>
                </li>
            );
                                         }) 
        }
        </ul>
        </div>
    );
  }
};

const mapStateToProps = (state)=> {
  console.log(state.employees);
  return {
    employees: state.employees
  };
}
const EmployeesContainer = connect(mapStateToProps)(Employees);

class Employee extends Component{
  constructor(props){
    super(props);
  }
  componentDidMount(){
    if(!this.props.employee){
      this.props.dispatch(getEmployeeFromServer(this.props.params.id));
    }
  }
  render(){
    if(!this.props.employee){
      return <div></div>;
    }
    return (
        <div className='well'>
        { this.props.employee.name }
        </div>
    );
  }
};

const EmployeeContainer = connect(
    (state, ownParams)=> {
      const employees = state.employees.filter( (employee)=> employee.id == ownParams.params.id ); 
      return {
        employee: employees.length ? employees[0]: null 
      }
    })( Employee );

render(<Provider store={store}>
    <Router history={hashHistory}>
      <Route path='/' component={Layout }>
        <IndexRoute component={Home} />
        <Route path='home' component={Home} />
        <Route path='employees' component={EmployeesContainer} />
        <Route path='employees/:id' component={EmployeeContainer} />
      </Route>
    </Router></Provider>, document.getElementById('root'));

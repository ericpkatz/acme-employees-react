const express = require('express');
const path = require('path');

const app = express();

let employees = [{ id: 1, name: 'Moe'}, { id: 2, name: 'Larry'} ];

app.use('/dist', express.static(path.join(__dirname, 'dist')));
app.use('/vendor', express.static(path.join(__dirname, 'node_modules')));

app.get('/', (req, res)=> res.sendFile(path.join(__dirname, 'index.html')));
app.get('/api/employees/reset', (req, res)=> {
  employees = [{ id: 1, name: 'Moe'}, { id: 2, name: 'Larry'} ];
  res.sendStatus(200);
});
app.get('/api/employees', (req, res)=> res.send(employees));
app.get('/api/employees/:id', (req, res)=> {
  let employee = employees.filter( employee=> employee.id == req.params.id)[0];
  res.send(employee);
});




app.delete('/api/employees/:id', (req, res)=> {
  employees = employees.filter( employee=> employee.id != req.params.id);
  res.sendStatus(200);
});

const port = process.env.PORT || 3000;

app.listen(port, ()=> console.log(`listening on port ${port}`));

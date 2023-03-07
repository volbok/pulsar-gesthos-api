// login com token.
require("dotenv-safe").config();
const jwt = require('jsonwebtoken');
const moment = require("moment");

const express = require("express");
const bodyParser = require("body-parser");
var cors = require("cors");
const { request } = require("express");
const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  // res.header("Access-Control-Request-Private-Network", "false");
  res.header("Access-Control-Allow-Private-Network", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get("/", (request, response) => {
  response.json({
    info: "API Node.js + Express + Postgres API - PULSAR + GESTHOS",
  });
});

app.listen(PORT, () => {
  console.log("API rodando na porta " + PORT);
});

const Pool = require("pg").Pool;
const pool = new Pool({

  /*
    user: "postgres",
    host: "localhost",
    database: "pulsar",
    password: "pulsar",
    port: 5432,
  */

  user: "postgres",
  host: "containers-us-west-126.railway.app",
  database: "railway",
  password: "f2khuqQugWUlvotCSYJS",
  port: 6801,

});

// ENDPOINTS //

// CLIENTES (HOSPITAIS E UNIDADES DE SAÚDE).
// listar todos os clientes (hospitais).
app.get("/list_hospitais", (req, res) => {
  var sql = "SELECT * FROM cliente_hospital";
  pool.query(sql, (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// CLIENTES (HOSPITAIS E UNIDADES DE SAÚDE).
// listar todos as unidades de internação.
app.get("/list_unidades", (req, res) => {
  var sql = "SELECT * FROM cliente_unidade";
  pool.query(sql, (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// USUÁRIOS.
// login e identificação do usuário, com entrega de token (JWT).
app.post("/checkusuario", (req, res) => {
  const {
    usuario,
    senha
  } = req.body;
  var sql = "SELECT * FROM usuarios WHERE login = $1 AND senha = $2";
  pool.query(sql, [usuario, senha], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });

    var x = results.rows;
    const id = x.map(item => item.id_usuario).pop();
    const nome = x.map(item => item.nome_usuario).pop();
    const dn = x.map(item => item.dn_usuario).pop();
    const cpf = x.map(item => item.cpf_usuario).pop();
    const email = x.map(item => item.email_usuario).pop();

    console.log(JSON.stringify(x));
    console.log('NOME: ' + nome);
    console.log('NOME: ' + dn);
    console.log('NOME: ' + cpf);
    console.log('NOME: ' + email);

    if (x.length > 0) {
      const token = jwt.sign({ id }, process.env.SECRET, {
        expiresIn: 1800 // expira em 30 minutos.
      });
      res.json({ auth: true, token: token, id: id, nome: nome, dn: dn, cpf: cpf, email: email });
    } else {
      res.json({ auth: false })
    }
  });
});

function verifyJWT(req, res, next) {
  const token = req.headers.authorization;
  console.log('TOKEN RECEBIDO DO FRONT: ' + req.headers.authorization);
  if (!token) return res.status(401).json({ auth: false, message: 'NENHUM TOKEN FOI GERADO. ACESSO NEGADO.' });

  jwt.verify(token, process.env.SECRET, function (err, decoded) {
    if (err) return res.status(500).json({ auth: false, message: 'TOKEN PARA VALIDAÇÃO DO ACESSO EXPIRADO.' });
    // se tudo estiver ok, salva no request para uso posterior
    req.userId = decoded.id;
    next();
  });
}

// identificando unidades de acesso do usuário logado.
app.post("/getunidades", verifyJWT, (req, res) => {
  const {
    id_usuario,
  } = req.body;
  var sql = "SELECT * FROM usuarios_acessos WHERE id_usuario = $1";
  pool.query(sql, [id_usuario], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// listar todos os usuários cadastrados na aplicação.
app.get("/list_usuarios", verifyJWT, (req, res) => {
  var sql = "SELECT * FROM usuarios";
  pool.query(sql, (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// inserir usuário.
app.post("/insert_usuario", (req, res) => {
  const {
    nome_usuario,
    dn_usuario,
    cpf_usuario,
    email_usuario,
    senha,
    login,
  } = req.body;
  var sql = "INSERT INTO usuarios (nome_usuario, dn_usuario, cpf_usuario, email_usuario, senha, login) VALUES ($1, $2, $3, $4, $5, $6)";
  pool.query(sql, [
    nome_usuario,
    dn_usuario,
    cpf_usuario,
    email_usuario,
    senha,
    login,
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// atualizar usuário.
app.post("/update_usuario/:id_usuario", (req, res) => {
  const id_usuario = parseInt(req.params.id_usuario);
  const {
    nome_usuario,
    dn_usuario,
    cpf_usuario,
    email_usuario,
    senha,
    login,
  } = req.body;
  var sql = "UPDATE usuarios SET nome_usuario = $1, dn_usuario = $2, cpf_usuario = $3, email_usuario = $4, senha = $5, login = $6 WHERE id_usuario = $7";
  pool.query(sql, [
    nome_usuario,
    dn_usuario,
    cpf_usuario,
    email_usuario,
    senha,
    login,
    id_usuario,
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// excluir usuário.
app.get("/delete_usuario/:id_usuario", (req, res) => {
  const id_usuario = parseInt(req.params.id_usuario);
  var sql = "DELETE FROM usuarios WHERE id_usuario = $1";
  pool.query(sql, [id_usuario], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// ACESSOS.
// listar todos os hospitais cadastrados.
app.get("/list_hospitais", (req, res) => {
  var sql = "SELECT * FROM cliente_hospital";
  pool.query(sql, (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// listar todas as unidades vinculadas a hospitais cadastradas.
app.get("/list_unidades", (req, res) => {
  var sql = "SELECT * FROM cliente_unidade";
  pool.query(sql, (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// listar todos os acessos cadastrados.
app.get("/list_todos_acessos", (req, res) => {
  var sql = "SELECT * FROM usuarios_acessos";
  pool.query(sql, (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// listar os acessos cadastrados para a unidade controlada pelo coordenador do serviço.
app.get("/list_acessos/:id_unidade", (req, res) => {
  const id_unidade = parseInt(req.params.id_unidade);
  var sql = "SELECT * FROM usuarios_acessos WHERE id_unidade = $1";
  pool.query(sql, [id_unidade], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// inserir acesso.
app.post("/insert_acesso", (req, res) => {
  const {
    id_cliente, // hospital.
    id_unidade, // cti.
    id_usuario, // id do usuário.
    boss, // privilégio para manipular acessos.
  } = req.body;
  var sql = "INSERT INTO usuarios_acessos (id_cliente, id_unidade, id_usuario, boss) VALUES ($1, $2, $3, $4)";
  pool.query(sql, [
    id_cliente,
    id_unidade,
    id_usuario,
    boss,
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// atualizar acesso.
app.post("/update_acesso/:id_acesso", (req, res) => {
  const id_acesso = parseInt(req.params.id_acesso);
  const {
    id_cliente,
    id_unidade,
    id_usuario,
    boss,
  } = req.body;
  var sql = "UPDATE usuarios_acessos SET id_cliente = $1, id_unidade = $2, id_usuario = $3, boss = $4 WHERE id_acesso = $5";
  pool.query(sql, [
    id_cliente,
    id_unidade,
    id_usuario,
    boss,
    id_acesso,
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// excluir acesso.
app.get("/delete_acesso/:id_acesso", (req, res) => {
  const id_acesso = parseInt(req.params.id_acesso);
  var sql = "DELETE FROM usuarios_acessos WHERE id_acesso = $1";
  pool.query(sql, [id_acesso], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// PACIENTES.
// listar todos os pacientes internados.
app.get("/list_pacientes", verifyJWT, (req, res) => {
  var sql = "SELECT * FROM gesthos_pacientes";
  pool.query(sql, (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// inserir paciente internado.
app.post("/insert_paciente", (req, res) => {
  const {
    prontuario,
    paciente,
    antecedentes_pessoais,
    medicacoes_previas,
    exames_previos,
    exames_atuais,
  } = req.body;
  var sql = "INSERT INTO gesthos_pacientes (prontuario, paciente, antecedentes_pessoais, medicacoes_previas, exames_previos, exames_atuais) VALUES ($1, $2, $3, $4, $5, $6)"
  pool.query(sql, [
    prontuario,
    paciente,
    antecedentes_pessoais,
    medicacoes_previas,
    exames_previos,
    exames_atuais,
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// atualizar paciente.
app.post("/update_paciente/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const {
    prontuario,
    paciente,
    antecedentes_pessoais,
    medicacoes_previas,
    exames_previos,
    exames_atuais,
  } = req.body;
  var sql = "UPDATE gesthos_pacientes SET prontuario = $1, paciente = $2, antecedentes_pessoais = $3, medicacoes_previas = $4, exames_previos = $5, exames_atuais = $6 WHERE id = $7";
  pool.query(sql, [
    prontuario,
    paciente,
    antecedentes_pessoais,
    medicacoes_previas,
    exames_previos,
    exames_atuais,
    id
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// excluir paciente.
app.get("/delete_paciente/:id_paciente", (req, res) => {
  const id_paciente = parseInt(req.params.id_paciente);
  var sql = "DELETE FROM gesthos_pacientes WHERE id = $1";
  pool.query(sql, [id_paciente], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// PACIENTES - ALERGIAS.
// listar todas as alergias do paciente selecionado.
app.get("/paciente_alergias/:id_paciente", verifyJWT, (req, res) => {
  const id_paciente = parseInt(req.params.id_paciente);
  var sql = "SELECT * FROM paciente_alergias WHERE id_paciente = $1";
  pool.query(sql, [id_paciente], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// inserir alergia.
app.post("/insert_alergia", (req, res) => {
  const {
    id_paciente,
    alergia
  } = req.body;
  var sql = "INSERT INTO paciente_alergias (id_paciente, alergia) VALUES ($1, $2)"
  pool.query(sql, [
    id_paciente,
    alergia,
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// atualizar alergia.
app.post("/update_alergia/:id_alergia", (req, res) => {
  const id_alergia = parseInt(req.params.id_alergia);
  const {
    id_paciente,
    alergia
  } = req.body;
  var sql = "UPDATE paciente_alergias SET id_paciente = $1, alergia = $2 WHERE id_alergia = $3";
  pool.query(sql, [
    id_paciente,
    alergia,
    id_alergia
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// excluir alergia.
app.get("/delete_alergia/:id_alergia", (req, res) => {
  const id_alergia = parseInt(req.params.id_alergia);
  var sql = "DELETE FROM paciente_alergias WHERE id_alergia = $1";
  pool.query(sql, [id_alergia], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// PACIENTES - LESÕES.
// listar todas as lesões do paciente selecionado.
app.get("/paciente_lesoes/:id_paciente", (req, res) => {
  const id_paciente = parseInt(req.params.id_paciente);
  var sql = "SELECT * FROM paciente_lesoes WHERE id_paciente = $1";
  pool.query(sql, [id_paciente], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// inserir lesão.
app.post("/insert_lesao", (req, res) => {
  const {
    id_paciente,
    local,
    grau,
    curativo,
    observacoes,
    data_abertura,
    data_fechamento
  } = req.body;
  var sql = "INSERT INTO paciente_lesoes (id_paciente, local, grau, curativo, observacoes, data_abertura, data_fechamento) VALUES ($1, $2, $3, $4, $5, $6, $7)"
  pool.query(sql, [
    id_paciente,
    local,
    grau,
    curativo,
    observacoes,
    data_abertura,
    data_fechamento
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// atualizar lesão.
app.post("/update_lesao/:id_lesao", (req, res) => {
  const id_lesao = parseInt(req.params.id_lesao);
  const {
    id_paciente,
    local,
    grau,
    curativo,
    observacoes,
    data_abertura,
    data_fechamento
  } = req.body;
  var sql = "UPDATE paciente_lesoes SET id_paciente = $1, local = $2, grau = $3, curativo = $4, observacoes = $5, data_abertura = $6, data_fechamento = $7 WHERE id_lesao = $8";
  pool.query(sql, [
    id_paciente,
    local,
    grau,
    curativo,
    observacoes,
    data_abertura,
    data_fechamento,
    id_lesao
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// excluir lesão.
app.get("/delete_lesao/:id_lesao", (req, res) => {
  const id_lesao = parseInt(req.params.id_lesao);
  var sql = "DELETE FROM paciente_lesoes WHERE id_lesao = $1";
  pool.query(sql, [id_lesao], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// PACIENTES - PRECAUÇÕES.
// listar todas as precauções do paciente selecionado.
app.get("/paciente_precaucoes/:id_paciente", (req, res) => {
  const id_paciente = parseInt(req.params.id_paciente);
  var sql = "SELECT * FROM paciente_precaucoes WHERE id_paciente = $1";
  pool.query(sql, [id_paciente], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// inserir precaução.
app.post("/insert_precaucao", (req, res) => {
  const {
    id_paciente,
    precaucao,
    data_inicio,
    data_termino
  } = req.body;
  var sql = "INSERT INTO paciente_precaucoes (id_paciente, precaucao, data_inicio, data_termino) VALUES ($1, $2, $3, $4)"
  pool.query(sql, [
    id_paciente,
    precaucao,
    data_inicio,
    data_termino
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// atualizar precaução.
app.post("/update_precaucao/:id_precaucao", (req, res) => {
  const id_precaucao = parseInt(req.params.id_precaucao);
  const {
    id_paciente,
    precaucao,
    data_inicio,
    data_termino
  } = req.body;
  var sql = "UPDATE paciente_precaucoes SET id_paciente = $1, precaucao = $2, data_inicio = $3, data_termino = $4 WHERE id_precaucao = $5";
  pool.query(sql, [
    id_paciente,
    precaucao,
    data_inicio,
    data_termino,
    id_precaucao
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// excluir precaução.
app.get("/delete_precaucao/:id_precaucao", (req, res) => {
  const id_precaucao = parseInt(req.params.id_precaucao);
  var sql = "DELETE FROM paciente_precaucoes WHERE id_precaucao = $1";
  pool.query(sql, [id_precaucao], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// PACIENTES - PRECAUÇÕES.
// listar todos os riscos do paciente selecionado.
app.get("/paciente_riscos/:id_paciente", (req, res) => {
  const id_paciente = parseInt(req.params.id_paciente);
  var sql = "SELECT * FROM paciente_riscos WHERE id_paciente = $1";
  pool.query(sql, [id_paciente], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// inserir risco.
app.post("/insert_risco", (req, res) => {
  const {
    id_paciente,
    risco
  } = req.body;
  var sql = "INSERT INTO paciente_riscos (id_paciente, risco) VALUES ($1, $2)"
  pool.query(sql, [
    id_paciente,
    risco
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// atualizar risco.
app.post("/update_risco/:id_risco", (req, res) => {
  const id_risco = parseInt(req.params.id_risco);
  const {
    id_paciente,
    risco
  } = req.body;
  var sql = "UPDATE paciente_riscos SET id_paciente = $1, risco = $2 WHERE id_risco = $3";
  pool.query(sql, [
    id_paciente,
    risco,
    id_risco
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// excluir risco.
app.get("/delete_risco/:id_risco", (req, res) => {
  const id_risco = parseInt(req.params.id_risco);
  var sql = "DELETE FROM paciente_riscos WHERE id_risco = $1";
  pool.query(sql, [id_risco], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// ATENDIMENTOS.
// listar todos os atendimentos do paciente selecionado.
app.get("/list_atendimentos/:id_unidade", verifyJWT, (req, res) => {
  const id_unidade = parseInt(req.params.id_unidade);
  var sql = "SELECT * FROM atendimento WHERE id_unidade = $1 AND data_termino IS NULL";
  pool.query(sql, [id_unidade], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// inserir atendimento.
app.post("/insert_atendimento", (req, res) => {
  const {
    data_inicio,
    data_termino,
    problemas,
    id_paciente,
    id_unidade,
    nome_paciente,
    leito,
    situacao
  } = req.body;
  var sql = "INSERT INTO atendimento (data_inicio, data_termino, problemas, id_paciente, id_unidade, nome_paciente, leito, situacao) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)"
  pool.query(sql, [
    data_inicio,
    data_termino,
    problemas,
    id_paciente,
    id_unidade,
    nome_paciente,
    leito,
    situacao
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// atualizar atendimento.
app.post("/update_atendimento/:id_atendimento", (req, res) => {
  const id_atendimento = parseInt(req.params.id_atendimento);
  const {
    data_inicio,
    data_termino,
    problemas,
    id_paciente,
    id_unidade,
    nome_paciente,
    leito,
    situacao
  } = req.body;
  var sql = "UPDATE atendimento SET data_inicio = $1, data_termino = $2, problemas = $3, id_paciente = $4, id_unidade = $5, nome_paciente = $6, leito = $7, situacao = $8 WHERE id_atendimento = $9";
  pool.query(sql, [
    data_inicio,
    data_termino,
    problemas,
    id_paciente,
    id_unidade,
    nome_paciente,
    leito,
    situacao,
    id_atendimento
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// excluir atendimento.
app.get("/delete_atendimento/:id_atendimento", (req, res) => {
  const id_atendimento = parseInt(req.params.id_atendimento);
  var sql = "DELETE FROM atendimento WHERE id_atendimento = $1";
  pool.query(sql, [id_atendimento], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// ATENDIMENTOS - EVOLUÇÕES.
// listar todas as evoluções do atendimento selecionado.
app.get("/list_evolucoes/:id_atendimento", (req, res) => {
  const id_atendimento = parseInt(req.params.id_atendimento);
  var sql = "SELECT * FROM atendimento_evolucoes WHERE id_atendimento = $1";
  pool.query(sql, [id_atendimento], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// inserir evolução.
app.post("/insert_evolucao", (req, res) => {
  const {
    id_atendimento,
    evolucao,
    data_evolucao,
    id_usuario
  } = req.body;
  var sql = "INSERT INTO atendimento_evolucoes (id_atendimento, evolucao, data_evolucao, id_usuario) VALUES ($1, $2, $3, $4)"
  pool.query(sql, [
    id_atendimento,
    evolucao,
    data_evolucao,
    id_usuario
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// atualizar evolucao.
app.post("/update_evolucao/:id_evolucao", (req, res) => {
  const id_evolucao = parseInt(req.params.id_evolucao);
  const {
    id_atendimento,
    evolucao,
    data_evolucao,
    id_usuario
  } = req.body;
  var sql = "UPDATE atendimento_evolucoes SET id_atendimento = $1, evolucao = $2, data_evolucao = $3, id_usuario = $4 WHERE id_evolucao = $5";
  pool.query(sql, [
    id_atendimento,
    evolucao,
    data_evolucao,
    id_usuario,
    id_evolucao
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// excluir evolucao.
app.get("/delete_evolucao/:id_evolucao", (req, res) => {
  const id_evolucao = parseInt(req.params.id_evolucao);
  var sql = "DELETE FROM atendimento_evolucoes WHERE id_evolucao = $1";
  pool.query(sql, [id_evolucao], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// ATENDIMENTOS - INFUSÕES.
// listar todas as infusões do atendimento selecionado.
app.get("/list_infusoes/:id_atendimento", (req, res) => {
  const id_atendimento = parseInt(req.params.id_atendimento);
  var sql = "SELECT * FROM atendimento_infusoes WHERE id_atendimento = $1";
  pool.query(sql, [id_atendimento], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// inserir infusão.
app.post("/insert_infusao", (req, res) => {
  const {
    id_atendimento,
    droga,
    velocidade,
    data_inicio,
    data_termino
  } = req.body;
  var sql = "INSERT INTO atendimento_infusoes (id_atendimento, droga, velocidade, data_inicio, data_termino) VALUES ($1, $2, $3, $4, $5)"
  pool.query(sql, [
    id_atendimento,
    droga,
    velocidade,
    data_inicio,
    data_termino
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// atualizar infusão.
app.post("/update_infusao/:id_infusao", (req, res) => {
  const id_infusao = parseInt(req.params.id_infusao);
  const {
    id_atendimento,
    droga,
    velocidade,
    data_inicio,
    data_termino
  } = req.body;
  var sql = "UPDATE atendimento_infusoes SET id_atendimento = $1, droga = $2, velocidade = $3, data_inicio = $4, data_termino = $5 WHERE id_infusao = $6";
  pool.query(sql, [
    id_atendimento,
    droga,
    velocidade,
    data_inicio,
    data_termino,
    id_infusao
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// excluir infusão.
app.get("/delete_infusao/:id_infusao", (req, res) => {
  const id_infusao = parseInt(req.params.id_infusao);
  var sql = "DELETE FROM atendimento_infusoes WHERE id_infusao = $1";
  pool.query(sql, [id_infusao], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// ATENDIMENTOS - INVASÕES.
// listar todas as invasões do atendimento selecionado.
app.get("/list_invasoes/:id_atendimento", (req, res) => {
  const id_atendimento = parseInt(req.params.id_atendimento);
  var sql = "SELECT * FROM atendimento_invasoes WHERE id_atendimento = $1";
  pool.query(sql, [id_atendimento], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// inserir invasão.
app.post("/insert_invasao", (req, res) => {
  const {
    id_atendimento,
    local,
    dispositivo,
    data_implante,
    data_retirada
  } = req.body;
  var sql = "INSERT INTO atendimento_invasoes (id_atendimento, local, dispositivo, data_implante, data_retirada) VALUES ($1, $2, $3, $4, $5)"
  pool.query(sql, [
    id_atendimento,
    local,
    dispositivo,
    data_implante,
    data_retirada
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// atualizar invasão.
app.post("/update_invasao/:id_invasao", (req, res) => {
  const id_invasao = parseInt(req.params.id_invasao);
  const {
    id_atendimento,
    local,
    dispositivo,
    data_implante,
    data_retirada
  } = req.body;
  var sql = "UPDATE atendimento_invasoes SET id_atendimento = $1, local = $2, dispositivo = $3, data_implante = $4, data_retirada = $5 WHERE id_invasao = $6";
  pool.query(sql, [
    id_atendimento,
    local,
    dispositivo,
    data_implante,
    data_retirada,
    id_invasao
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// excluir invasão.
app.get("/delete_invasao/:id_invasao", (req, res) => {
  const id_invasao = parseInt(req.params.id_invasao);
  var sql = "DELETE FROM atendimento_invasoes WHERE id_invasao = $1";
  pool.query(sql, [id_invasao], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// ATENDIMENTOS - PROPOSTAS.
// listar todas as propostas do atendimento selecionado.
app.get("/list_propostas/:id_atendimento", (req, res) => {
  const id_atendimento = parseInt(req.params.id_atendimento);
  var sql = "SELECT * FROM atendimento_propostas WHERE id_atendimento = $1";
  pool.query(sql, [id_atendimento], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// inserir proposta.
app.post("/insert_proposta", (req, res) => {
  const {
    id_atendimento,
    proposta,
    status,
    data_proposta,
    id_usuario,
    prazo,
    data_conclusao,
  } = req.body;
  var sql = "INSERT INTO atendimento_propostas (id_atendimento, proposta, status, data_proposta, id_usuario, prazo, data_conclusao) VALUES ($1, $2, $3, $4, $5, $6, $7)"
  pool.query(sql, [
    id_atendimento,
    proposta,
    status,
    data_proposta,
    id_usuario,
    prazo,
    data_conclusao,
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// atualizar proposta.
app.post("/update_proposta/:id_proposta", (req, res) => {
  const id_proposta = parseInt(req.params.id_proposta);
  const {
    id_atendimento,
    proposta,
    status,
    data_proposta,
    id_usuario,
    prazo,
    data_conclusao,
  } = req.body;
  var sql = "UPDATE atendimento_propostas SET id_atendimento = $1, proposta = $2, status = $3, data_proposta = $4, id_usuario = $5, prazo = $6, data_conclusao = $7 WHERE id_proposta = $8";
  pool.query(sql, [
    id_atendimento,
    proposta,
    status,
    data_proposta,
    id_usuario,
    prazo,
    data_conclusao,
    id_proposta
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// excluir proposta.
app.get("/delete_proposta/:id_proposta", (req, res) => {
  const id_proposta = parseInt(req.params.id_proposta);
  var sql = "DELETE FROM atendimento_propostas WHERE id_proposta = $1";
  pool.query(sql, [id_proposta], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// ATENDIMENTOS - SINAIS VITAIS.
// listar todos os registros de sinais vitais do atendimento selecionado.
app.get("/list_sinais_vitais/:id_atendimento", (req, res) => {
  const id_atendimento = parseInt(req.params.id_atendimento);
  var sql = "SELECT * FROM atendimento_sinais_vitais WHERE id_atendimento = $1";
  pool.query(sql, [id_atendimento], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// inserir sinais vitais.
app.post("/insert_sinais_vitais", (req, res) => {
  const {
    id_atendimento,
    pas, pad, fc, fr, sao2, tax,
    glicemia,
    diurese, balanco,
    evacuacao, estase,
    data_sinais_vitais
  } = req.body;
  var sql = "INSERT INTO atendimento_sinais_vitais (id_atendimento, pas, pad, fc, fr, sao2, tax, glicemia, diurese, balanco, evacuacao, estase, data_sinais_vitais) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)"
  pool.query(sql, [
    id_atendimento,
    pas, pad, fc, fr, sao2, tax,
    glicemia,
    diurese, balanco,
    evacuacao, estase,
    data_sinais_vitais
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// atualizar sinais vitais.
app.post("/update_sinais_vitais/:id_sinais_vitais", (req, res) => {
  const id_sinais_vitais = parseInt(req.params.id_sinais_vitais);
  const {
    id_atendimento,
    pas, pad, fc, fr, sao2, tax,
    glicemia,
    diurese, balanco,
    evacuacao, estase,
    data_sinais_vitais
  } = req.body;
  var sql = "UPDATE atendimento_sinais_vitais SET id_atendimento = $1, pas = $2, pad = $3, fc = $4, fr = $5, sao2 = $6, tax  = $7, glicemia  = $8, diurese = $9, balanco = $10, evacuacao = $11, estase  = $12, data_sinais_vitais  = $13 WHERE id_sinais_vitais = $14";
  pool.query(sql, [
    id_atendimento,
    pas, pad, fc, fr, sao2, tax,
    glicemia,
    diurese, balanco,
    evacuacao, estase,
    data_sinais_vitais,
    id_sinais_vitais
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// excluir sinais vitais.
app.get("/delete_sinais_vitais/:id_sinais_vitais", (req, res) => {
  const id_sinais_vitais = parseInt(req.params.id_sinais_vitais);
  var sql = "DELETE FROM atendimento_sinais_vitais WHERE id_sinais_vitais = $1";
  pool.query(sql, [id_sinais_vitais], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// ATENDIMENTOS - VENTILAÇÃO MECÂNICA.
// listar todos os registros de ventilaçção mecânica (VM) do atendimento selecionado.
app.get("/list_vm/:id_atendimento", (req, res) => {
  const id_atendimento = parseInt(req.params.id_atendimento);
  var sql = "SELECT * FROM atendimento_vm WHERE id_atendimento = $1";
  pool.query(sql, [id_atendimento], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// inserir vm.
app.post("/insert_vm", (req, res) => {
  const {
    id_atendimento,
    modo,
    pressao,
    volume,
    peep,
    fio2,
    data_vm
  } = req.body;
  var sql = "INSERT INTO atendimento_vm (id_atendimento, modo, pressao, volume, peep, fio2, data_vm) VALUES ($1, $2, $3, $4, $5, $6, $7)"
  pool.query(sql, [
    id_atendimento,
    modo,
    pressao,
    volume,
    peep,
    fio2,
    data_vm
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// atualizar vm.
app.post("/update_vm/:id_vm", (req, res) => {
  const id_vm = parseInt(req.params.id_vm);
  const {
    id_atendimento,
    modo,
    pressao,
    volume,
    peep,
    fio2,
    data_vm
  } = req.body;
  var sql = "UPDATE atendimento_vm SET id_atendimento = $1, modo = $2, pressao = $3, volume = $4, peep = $5, fio2 = $6, data_vm  = $7 WHERE id_vm = $8";
  pool.query(sql, [
    id_atendimento,
    modo,
    pressao,
    volume,
    peep,
    fio2,
    data_vm,
    id_vm
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// excluir vm.
app.get("/delete_vm/:id_vm", (req, res) => {
  const id_vm = parseInt(req.params.id_vm);
  var sql = "DELETE FROM atendimento_vm WHERE id_vm = $1";
  pool.query(sql, [id_vm], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// ATENDIMENTOS - CULTURAS.
// listar todos os registros de culturas relativos ao atendimento selecionado.
app.get("/list_culturas/:id_atendimento", (req, res) => {
  const id_atendimento = parseInt(req.params.id_atendimento);
  var sql = "SELECT * FROM atendimento_culturas WHERE id_atendimento = $1";
  pool.query(sql, [id_atendimento], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// inserir cultura.
app.post("/insert_cultura", (req, res) => {
  const {
    id_atendimento,
    material,
    resultado,
    data_pedido,
    data_resultado,
  } = req.body;
  var sql = "INSERT INTO atendimento_culturas (id_atendimento, material, resultado, data_pedido, data_resultado) VALUES ($1, $2, $3, $4, $5)"
  pool.query(sql, [
    id_atendimento,
    material,
    resultado,
    data_pedido,
    data_resultado,
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// atualizar cultura.
app.post("/update_cultura/:id_cultura", (req, res) => {
  const id_cultura = parseInt(req.params.id_cultura);
  const {
    id_atendimento,
    material,
    resultado,
    data_pedido,
    data_resultado,
  } = req.body;
  var sql = "UPDATE atendimento_culturas SET id_atendimento = $1, material = $2, resultado = $3, data_pedido = $4, data_resultado = $5 WHERE id_cultura = $6";
  pool.query(sql, [
    id_atendimento,
    material,
    resultado,
    data_pedido,
    data_resultado,
    id_cultura
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// excluir cultura.
app.get("/delete_cultura/:id_cultura", (req, res) => {
  const id_cultura = parseInt(req.params.id_cultura);
  var sql = "DELETE FROM atendimento_culturas WHERE id_cultura = $1";
  pool.query(sql, [id_cultura], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// ATENDIMENTOS - ANTIBIÓTICOS.
// listar todos os registros de antibióticos relativos ao atendimento selecionado.
app.get("/list_antibioticos/:id_atendimento", (req, res) => {
  const id_atendimento = parseInt(req.params.id_atendimento);
  var sql = "SELECT * FROM atendimento_antibioticos WHERE id_atendimento = $1";
  pool.query(sql, [id_atendimento], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// inserir antibiótico.
app.post("/insert_antibiotico", (req, res) => {
  const {
    id_atendimento,
    antibiotico,
    data_inicio,
    data_termino,
    prazo,
  } = req.body;
  var sql = "INSERT INTO atendimento_antibioticos (id_atendimento, antibiotico, data_inicio, data_termino, prazo) VALUES ($1, $2, $3, $4, $5)"
  pool.query(sql, [
    id_atendimento,
    antibiotico,
    data_inicio,
    data_termino,
    prazo,
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// atualizar antibiótico.
app.post("/update_antibiotico/:id_antibiotico", (req, res) => {
  const id_antibiotico = parseInt(req.params.id_antibiotico);
  const {
    id_atendimento,
    antibiotico,
    data_inicio,
    data_termino,
    prazo,
  } = req.body;
  var sql = "UPDATE atendimento_antibioticos SET id_atendimento = $1, antibiotico = $2, data_inicio = $3, data_termino = $4, prazo = $5 WHERE id_antibiotico = $6";
  pool.query(sql, [
    id_atendimento,
    antibiotico,
    data_inicio,
    data_termino,
    prazo,
    id_antibiotico
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// excluir antibiótico.
app.get("/delete_antibiotico/:id_antibiotico", (req, res) => {
  const id_antibiotico = parseInt(req.params.id_antibiotico);
  var sql = "DELETE FROM atendimento_antibioticos WHERE id_antibiotico = $1";
  pool.query(sql, [id_antibiotico], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// ATENDIMENTOS - DIETA.
// listar todos os registros de dieta relativos ao atendimento selecionado.
app.get("/list_dietas/:id_atendimento", (req, res) => {
  const id_atendimento = parseInt(req.params.id_atendimento);
  var sql = "SELECT * FROM atendimento_dietas WHERE id_atendimento = $1";
  pool.query(sql, [id_atendimento], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// inserir dieta.
app.post("/insert_dieta", (req, res) => {
  const {
    infusao,
    get,
    tipo,
    data_inicio,
    data_termino,
    id_atendimento
  } = req.body;
  var sql = "INSERT INTO atendimento_dietas (infusao, get, tipo, data_inicio, data_termino, id_atendimento) VALUES ($1, $2, $3, $4, $5, $6)"
  pool.query(sql, [
    infusao,
    get,
    tipo,
    data_inicio,
    data_termino,
    id_atendimento
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// atualizar dieta.
app.post("/update_dieta/:id_dieta", (req, res) => {
  const id_dieta = parseInt(req.params.id_dieta);
  const {
    infusao,
    get,
    tipo,
    data_inicio,
    data_termino,
    id_atendimento
  } = req.body;
  var sql = "UPDATE atendimento_dietas SET infusao = $1, get = $2, tipo = $3, data_inicio = $4, data_termino = $5, id_atendimento = $6 WHERE id_dieta = $7";
  pool.query(sql, [
    infusao,
    get,
    tipo,
    data_inicio,
    data_termino,
    id_atendimento,
    id_dieta
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// excluir dieta.
app.get("/delete_dieta/:id_dieta", (req, res) => {
  const id_dieta = parseInt(req.params.id_dieta);
  var sql = "DELETE FROM atendimento_dietas WHERE id_dieta = $1";
  pool.query(sql, [id_dieta], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// ATENDIMENTOS - INTERCONSULTAS.
// listar todos os registros de interconsultas.
app.get("/all_interconsultas", (req, res) => {
  var sql = "SELECT * FROM atendimento_interconsultas";
  pool.query(sql, (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// listar todos os registros de interconsultas relativos ao atendimento selecionado.
app.get("/list_interconsultas/:id_atendimento", (req, res) => {
  const id_atendimento = parseInt(req.params.id_atendimento);
  var sql = "SELECT * FROM atendimento_interconsultas WHERE id_atendimento = $1";
  pool.query(sql, [id_atendimento], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// inserir interconsulta.
app.post("/insert_interconsulta", (req, res) => {
  const {
    id_atendimento,
    especialidade,
    status,
    data_pedido,
  } = req.body;
  var sql = "INSERT INTO atendimento_interconsultas (id_atendimento, especialidade, status, data_pedido) VALUES ($1, $2, $3, $4)"
  pool.query(sql, [
    id_atendimento,
    especialidade,
    status,
    data_pedido,
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// atualizar interconsulta.
app.post("/update_interconsulta/:id_interconsulta", (req, res) => {
  const id_interconsulta = parseInt(req.params.id_interconsulta);
  const {
    id_atendimento,
    especialidade,
    status,
    data_pedido,
  } = req.body;
  var sql = "UPDATE atendimento_interconsultas SET id_atendimento = $1, especialidade = $2, status = $3, data_pedido = $4 WHERE id_interconsulta = $5";
  pool.query(sql, [
    id_atendimento,
    especialidade,
    status,
    data_pedido,
    id_interconsulta,
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// excluir interconsulta.
app.get("/delete_interconsulta/:id_interconsulta", (req, res) => {
  const id_interconsulta = parseInt(req.params.id_interconsulta);
  var sql = "DELETE FROM atendimento_interconsultas WHERE id_interconsulta = $1";
  pool.query(sql, [id_interconsulta], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// ## CONFIGURAÇÕES / SETTINGS ##
// listar configurações.
app.get("/settings/:id_usuario", (req, res) => {
  const id_usuario = parseInt(req.params.id_usuario);
  var sql = "SELECT * FROM settings WHERE id_usuario = $1";
  pool.query(sql, [id_usuario], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// inserir configurações.
app.post("/insert_settings", (req, res) => {
  const {
    id_usuario,
    tema,
    card_diasinternacao,
    card_alergias,
    card_anamnese,
    card_evolucoes,
    card_propostas,
    card_precaucoes,
    card_riscos,
    card_alertas,
    card_sinaisvitais,
    card_body,
    card_vm,
    card_infusoes,
    card_dieta,
    card_culturas,
    card_antibioticos,
    card_interconsultas
  } = req.body;
  var sql = "INSERT INTO settings (id_usuario, tema, card_diasinternacao, card_alergias, card_anamnese, card_evolucoes, card_propostas, card_precaucoes, card_riscos, card_alertas, card_sinaisvitais, card_body, card_vm, card_infusoes, card_dieta, card_culturas, card_antibioticos, card_interconsultas) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)"
  pool.query(sql, [
    id_usuario,
    tema,
    card_diasinternacao,
    card_alergias,
    card_anamnese,
    card_evolucoes,
    card_propostas,
    card_precaucoes,
    card_riscos,
    card_alertas,
    card_sinaisvitais,
    card_body,
    card_vm,
    card_infusoes,
    card_dieta,
    card_culturas,
    card_antibioticos,
    card_interconsultas
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// atualizar configurações.
app.post("/update_settings/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const {
    id_usuario,
    tema,
    card_diasinternacao,
    card_alergias,
    card_anamnese,
    card_evolucoes,
    card_propostas,
    card_precaucoes,
    card_riscos,
    card_alertas,
    card_sinaisvitais,
    card_body,
    card_vm,
    card_infusoes,
    card_dieta,
    card_culturas,
    card_antibioticos,
    card_interconsultas
  } = req.body;
  var sql = "UPDATE settings SET id_usuario = $1, tema = $2, card_diasinternacao = $3, card_alergias = $4, card_anamnese = $5, card_evolucoes = $6, card_propostas = $7, card_precaucoes = $8, card_riscos = $9, card_alertas = $10, card_sinaisvitais = $11, card_body = $12, card_vm = $13, card_infusoes = $14, card_dieta = $15, card_culturas = $16, card_antibioticos = $17, card_interconsultas = $18 WHERE id = $19";
  pool.query(sql, [
    id_usuario,
    tema,
    card_diasinternacao,
    card_alergias,
    card_anamnese,
    card_evolucoes,
    card_propostas,
    card_precaucoes,
    card_riscos,
    card_alertas,
    card_sinaisvitais,
    card_body,
    card_vm,
    card_infusoes,
    card_dieta,
    card_culturas,
    card_antibioticos,
    card_interconsultas,
    id,
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// listagem de todos os dados dos atendimentos (para gerar PDF).
app.get("/all_evolucoes", (req, res) => {
  var sql = "SELECT * FROM atendimento_evolucoes";
  pool.query(sql, (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

app.get("/all_antibioticos", (req, res) => {
  var sql = "SELECT * FROM atendimento_antibioticos";
  pool.query(sql, (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

app.get("/all_culturas", (req, res) => {
  var sql = "SELECT * FROM atendimento_culturas";
  pool.query(sql, (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

app.get("/all_infusoes", (req, res) => {
  var sql = "SELECT * FROM atendimento_infusoes";
  pool.query(sql, (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

app.get("/all_invasoes", (req, res) => {
  var sql = "SELECT * FROM atendimento_invasoes";
  pool.query(sql, (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

app.get("/all_propostas", (req, res) => {
  var sql = "SELECT * FROM atendimento_propostas";
  pool.query(sql, (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

app.get("/all_vm", (req, res) => {
  var sql = "SELECT * FROM atendimento_vm";
  pool.query(sql, (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// ## PRESCRIÇÃO ##
app.get("/all_prescricoes", (req, res) => {
  var sql = "SELECT * FROM atendimento_prescricoes";
  pool.query(sql, (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// listar todos os registros de itens de prescrição relativas ao atendimento selecionado.
app.get("/list_prescricoes/:id_atendimento", (req, res) => {
  const id_atendimento = parseInt(req.params.id_atendimento);
  var sql = "SELECT * FROM atendimento_prescricoes WHERE id_atendimento = $1";
  pool.query(sql, [id_atendimento], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// inserir item de prescrição.
app.post("/insert_prescricao", (req, res) => {
  const {
    id_unidade,
    id_paciente,
    id_atendimento,
    categoria,
    componente,
    codigo_item,
    nome_item,
    qtde_item,
    via,
    freq,
    agora,
    acm,
    sn,
    obs,
    data,
    id_pai
  } = req.body;
  var sql = "INSERT INTO atendimento_prescricoes (id_unidade, id_paciente, id_atendimento, categoria, componente, codigo_item, nome_item, qtde_item, via, freq, agora, acm, sn, obs, data, id_pai) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)"
  pool.query(sql, [
    id_unidade,
    id_paciente,
    id_atendimento,
    categoria,
    componente,
    codigo_item,
    nome_item,
    qtde_item,
    via,
    freq,
    agora,
    acm,
    sn,
    obs,
    data,
    id_pai
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// atualizar item de prescrição.
app.post("/update_prescricao/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const {
    id_unidade,
    id_paciente,
    id_atendimento,
    categoria,
    componente,
    codigo_item,
    nome_item,
    qtde_item,
    via,
    freq,
    agora,
    acm,
    sn,
    obs,
    data,
    id_pai,
  } = req.body;
  var sql = "UPDATE atendimento_prescricoes SET id_unidade = $1, id_paciente = $2, id_atendimento = $3, categoria = $4, componente = $5, codigo_item = $6, nome_item = $7, qtde_item = $8, via = $9, freq = $10, agora = $11, acm = $12, sn = $13, obs = $14, data = $15, id_pai = $16 WHERE id = $17";
  pool.query(sql, [
    id_unidade,
    id_paciente,
    id_atendimento,
    categoria,
    componente,
    codigo_item,
    nome_item,
    qtde_item,
    via,
    freq,
    agora,
    acm,
    sn,
    obs,
    data,
    id_pai,
    id,
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// excluir registro de item de prescrição.
app.get("/delete_prescricao/:id", (req, res) => {
  const id = parseInt(req.params.id);
  var sql = "DELETE FROM atendimento_prescricoes WHERE id = $1";
  pool.query(sql, [id], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// ## OPÇÕES DE ITENS DE PRESCRIÇÃO ##
app.get("/opcoes_prescricoes", (req, res) => {
  var sql = "SELECT * FROM prescricoes";
  pool.query(sql, (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// inserir item de opção de prescrição.
app.post("/insert_opcoes_prescricao", (req, res) => {
  const {
    nome_item,
    categoria,
    qtde_item,
    via,
    freq,
    obs,
    id_pai,
  } = req.body;
  var sql = "INSERT INTO prescricoes (nome_item, categoria, qtde_item, via, freq, obs, id_pai) VALUES ($1, $2, $3, $4, $5, $6, $7)"
  pool.query(sql, [
    nome_item,
    categoria,
    qtde_item,
    via,
    freq,
    obs,
    id_pai,
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// atualizar item de opção de prescrição.
app.post("/update_opcoes_prescricao/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const {
    nome_item,
    categoria,
    qtde_item,
    via,
    freq,
    obs,
    id_pai,
  } = req.body;
  var sql = "UPDATE prescricoes SET nome_item = $1, categoria = $2, qtde_item = $3, via = $4, freq = $5, obs = $6, id_pai = $7 WHERE id = $8";
  pool.query(sql, [
    nome_item,
    categoria,
    qtde_item,
    via,
    freq,
    obs,
    id_pai,
    id,
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// excluir registro de opção de item de prescrição.
app.get("/delete_opcoes_prescricao/:id", (req, res) => {
  const id = parseInt(req.params.id);
  var sql = "DELETE FROM prescricoes WHERE id = $1";
  pool.query(sql, [id], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// ## INTEGRAÇÃO GESTHOS ## //
let atendimentos = []; // objetos "atendimento" injetados pelo robô Gesthos.
let assistenciais = []; // objetos "assistenciais" injetados pelo robô Gesthos.
let arrayassistencial = [];

// endpoint que retorna todos os registros de atendimento internados no banco de dados Pulsar.
app.get("/lista_atendimentos", (req, res) => {
  var sql = "SELECT * FROM gesthos_atendimento";
  pool.query(sql, (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// endpoint que retorna todos os registros assistenciais no banco de dados Pulsar.
app.get("/lista_assistencial", (req, res) => {
  var sql = "SELECT * FROM gesthos_assistencial";
  pool.query(sql, (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// função que insere no banco de dados Pulsar um registro de paciente, caso inexistente.
const inserePaciente = (obj) => {
  var sql = "INSERT INTO gesthos_pacientes (prontuario, paciente, antecedentes_pessoais, medicacoes_previas, exames_previos, exames_atuais) VALUES ($1, $2, $3, $4, $5, $6)"
  pool.query(sql, [
    obj.prontuario,
    obj.paciente,
    null,
    null,
    null,
    null,
  ], (error, results) => {
    if (error) return console.log('ERRO AO TENTAR REGISTRAR PACIENTE0');
    console.log('REGISTRO DE PACIENTE REALIZADO COM SUCESSO');
  });
}

// funções que deletam ou inserem objetos de internação, conforme os resultados das checagens realizadas pelas funções acima.
const deleteAtendimento = (obj) => {
  var sql = "DELETE FROM gesthos_atendimento WHERE atendimento = $1";
  pool.query(sql, [obj.atendimento], (error, results) => {
    console.log('REGISTRO DE ATENDIMENTO DELETADO COM SUCESSO');
  });
}
const insertAtendimento = (obj) => {
  var sql = "INSERT INTO gesthos_atendimento (data, prontuario, atendimento, paciente, sexo, nascimento, unidadeinternacao, leito, problemas, situacao) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)"
  pool.query(sql, [
    moment(obj.data).subtract(3, 'hours'),
    obj.prontuario,
    obj.atendimento,
    obj.paciente,
    obj.sexo,
    obj.nascimento,
    obj.unidadeinternacao,
    obj.leito,
    null,
    null
  ], (error, results) => {
    console.log('REGISTRO DE ATENDIMENTO INSERIDO NO BANCO COM SUCESSO');
    /* verificando se o paciente referente ao atendimento recém-criado já tem registro na tabela
    gesthos_pacientes (necessária para registro dos dados da anamnese). */
    var sql = "SELECT * FROM gesthos_pacientes";
    pool.query(sql, (error, results) => {
      let pacientes = results.rows;
      if (pacientes.filter(item => item.prontuario == obj.prontuario).length == 0) {
        // inserePaciente(obj);
      } else {
        console.log('PACIENTE JÁ TEM CADASTRO');
      }
    });
  });
}

app.post("/update_gesthos_atendimento/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const {
    data,
    hora,
    prontuario,
    atendimento,
    paciente,
    sexo,
    nascimento,
    unidadeinternacao,
    leito,
    problemas,
    situacao
  } = req.body;
  var sql = "UPDATE gesthos_atendimento SET data = $1, hora = $2, prontuario = $3, atendimento = $4, paciente = $5, sexo = $6, nascimento = $7, unidadeinternacao = $8, leito = $9, problemas = $10, situacao = $11 WHERE id = $12";
  pool.query(sql, [
    data,
    hora,
    prontuario,
    atendimento,
    paciente,
    sexo,
    nascimento,
    unidadeinternacao,
    leito,
    problemas,
    situacao,
    id
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
});

// função que insere objeto de registro assistencial no banco de dados Pulsar.
const insertRegistroAssistencial = (obj) => {
  // console.log('INSERINDO REGISTRO ASSISTENCIAL...');
  var sql = "INSERT INTO gesthos_assistencial (data, hora, prontuario, atendimento, grupo, item, valor) VALUES ($1, $2, $3, $4, $5, $6, $7)"
  pool.query(sql, [
    obj.data,
    obj.hora,
    obj.prontuario,
    obj.atendimento,
    obj.grupo,
    obj.item,
    obj.valor
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    // console.log('REGISTRO INSERIDO NO BANCO COM SUCESSO: ' + JSON.stringify(results));
  });
}

/* injetando objetos de internação e de alta (robô Gesthos >> api Pulsar), salvando no banco de dados
Pulsar os novos resgistros.
*/
let objetos = [];
let arrayInsertAtendimento = [];
let arrayDeleteAtendimento = [];
let arrayInsertPaciente = [];

const trataAtendimentos = () => {
  // mapeando os objetos sortidos por data e verificando se os mesmos já estão registrados no banco de dados.
  objetos.sort((a, b) => moment(a.data) > moment(b.data) ? 1 : -1).map(item => {
    // console.log(objetos.sort((a, b) => moment(a.data) > moment(b.data) ? 1 : -1).map(item => moment(item.data).format('DD/MM/YYYY HH:mm')));
    // retornando todos os registros de atendimento no banco de dados.
    var sql = "SELECT * FROM gesthos_atendimento";
    pool.query(sql, (error, results) => {
      let db_atendimentos = results.rows;
      /* 
      SITUAÇÃO 1:
      o objeto é uma internação,
      o objeto não tem registro prévio de atendimento no banco de dados,
      o objeto não tem um objeto de alta concorrente (mesmo atendimento) posterior.
      */
      if (item.situacao == 'internacao' &&
        db_atendimentos.filter(valor => valor.atendimento == item.atendimento).length == 0 &&
        objetos.filter(valor =>
          valor.situacao == 'alta' &&
          valor.atendimento == item.atendimento &&
          moment(valor.data) > moment(item.data)).length == 0
      ) {
        insertAtendimento(item);
        /*
        SITUAÇÃO 2:
        o objeto é uma internação,
        o objeto tem registro prévio de atendimento no banco de dados,
        o objeto tem um objeto de alta concorrente (mesmo atendimento) posterior.
        */
      } else if (item.situacao == 'internacao' &&
        db_atendimentos.filter(valor => valor.atendimento == item.atendimento).length > 0 &&
        objetos.filter(valor =>
          valor.situacao == 'alta' &&
          valor.atendimento == item.atendimento &&
          moment(valor.data) > moment(item.data)).length > 0
      ) {
        arrayDeleteAtendimento
        deleteAtendimento(item);
        /*
        SITUAÇÃO 3:
        o objeto é uma alta,
        o objeto tem registro prévio de atendimento no banco de dados,
        o objeto não tem um objeto de internação concorrente (mesmo atendimento) posterior.
        */
      } else if (item.situacao == 'alta' &&
        db_atendimentos.filter(valor => valor.atendimento == item.atendimento).length > 0 &&
        objetos.filter(valor =>
          valor.situacao == 'internacao' &&
          valor.atendimento == item.atendimento &&
          moment(valor.data) > moment(item.data)).length == 0
      ) {
        deleteAtendimento(item);
        /*
        SITUAÇÃO 4:
        o objeto é uma alta,
        o objeto não tem registro prévio de atendimento no banco de dados,
        o objeto tem um objeto de internação concorrente (mesmo atendimento) posterior.
        */
      } else if (item.situacao == 'alta' &&
        db_atendimentos.filter(valor => valor.atendimento == item.atendimento).length == 0 &&
        objetos.filter(valor =>
          valor.situacao == 'internacao' &&
          valor.atendimento == item.atendimento &&
          moment(valor.data) > moment(item.data)).length > 0
      ) {
        insertAtendimento(item);
        /*
        SITUAÇÃO 5:
        o objeto é uma alta,
        o objeto tem registro prévio de atendimento no banco de dados,
        o objeto tem um objeto de internação concorrente (mesmo atendimento) posterior.
        */
      } else if (item.situacao == 'alta' &&
        db_atendimentos.filter(valor => valor.atendimento == item.atendimento).length > 0 &&
        objetos.filter(valor =>
          valor.situacao == 'internacao' &&
          valor.atendimento == item.atendimento &&
          moment(valor.data) > moment(item.data)).length > 0
      ) {
        deleteAtendimento(item);
        insertAtendimento(item);

      } else {
        console.log('NADA A SER FEITO')
      }
    });
  });
}
app.post("/gesthos_atendimentos", (req, res) => {
  atendimentos = req.body;
  objetos = [];
  if (atendimentos == [] || atendimentos == null || atendimentos == undefined || atendimentos == '') {
    res.json({ message: 'SEM DADOS ENVIADOS PELO BOT GESTHOS.', content: atendimentos });
  } else {
    let resposta = [];
    resposta = atendimentos.pacientes;

    const createObjInternacao = (item) => {
      var obj = {
        'situacao': 'internacao',
        'data': moment(item.data + ' ' + item.hora, 'DD/MM/YYYY HH:mm:ss'),
        'prontuario': item.prontuario,
        'atendimento': item.atendimento,
        'paciente': item.paciente,
        'sexo': item.sexo,
        'nascimento': item.nascimento,
        'unidadeinternacao': item.unidadeinternacao,
        'leito': item.leito,
      }
      objetos.push(obj);
    }
    const createObjAlta = (item) => {
      var obj = {
        'situacao': 'alta',
        'data': moment(item.data + ' ' + item.hora, 'DD/MM/YYYY HH:mm:ss'),
        'prontuario': item.prontuario,
        'atendimento': item.atendimento,
        'paciente': item.paciente,
        'sexo': item.sexo,
        'nascimento': item.nascimento,
        'unidadeinternacao': item.unidadeinternacao,
        'leito': item.leito,
      }
      objetos.push(obj);
    }

    resposta.filter(item => item.hasOwnProperty("internacao") == true).map(item => createObjInternacao(item.internacao));
    resposta.filter(item => item.hasOwnProperty("alta") == true).map(item => createObjAlta(item.alta));
    trataAtendimentos();
  }
});

/*
injetando objetos de dados assistenciais (robô Gesthos >> api Pulsar), com gravação dos
mesmos no banco de dados Pulsar.
*/
app.post("/gesthos_assistencial", (req, res) => {
  arrayassistencial = [];
  assistenciais = req.body;
  if (assistenciais == [] || assistenciais == null || assistenciais == undefined || assistenciais == '') {
    res.json({ message: 'SEM DADOS ENVIADOS PELO BOT GESTHOS.', content: assistenciais });
  } else {
    let dados_assistenciais = [];
    dados_assistenciais = assistenciais.registro;
    dados_assistenciais.map(item => arrayassistencial.push(item));
    res.send('SUCESSO');
    // atualizando banco de dados.
    arrayassistencial.filter(item => item.hasOwnProperty('documento') == true).map(item => insertRegistroAssistencial(item.documento));
    arrayassistencial.filter(item => item.hasOwnProperty('precaucao') == true).map(item => insertRegistroAssistencial(item.precaucao));
    arrayassistencial.filter(item => item.hasOwnProperty('exame') == true).map(item => insertRegistroAssistencial(item.exame));
  }
});

// deletando registros assistenciais antigos do banco de dados.
const limpaBanco = () => {
  var sql = "DELETE FROM gesthos_assistencial WHERE TO_DATE(data,'DD/MM/YYYY') < CURRENT_DATE - INTERVAL '3' DAY";
  pool.query(sql, [], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    res.send(results);
  });
}

setInterval(() => {
  limpaBanco;
}, 3600000);
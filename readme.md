<h1>DOCUMENTAÇÃO PARA INTEGRAÇÃO GESTHOS + PULSAR</h1>

<h2>GESTHOS</h2>

<h3>ATENDIMENTOS</h3>
Uma aplicação criada no ambiente GestHos consumirá a endpoint http://pulsar-gesthos-api.up.railway.app/gesthos_atendimentos, encaminhando pelo método POST, em intervalos regulares, uma array de JSONs contendo informações referentes aos atendimentos (registros de internação e de alta dos pacientes).

<h3>ASSISTENCIAL</h3>
A mesma aplicação criada no ambiente GestHos consumirá a endpoint http://pulsar-gesthos-api.up.railway.app/gesthos_assistencial, encaminhando pelo método POST, em intervalos regulares, uma array de JSONs contendo informações referentes aos registros assistenciais (precauções, alergias, dados vitais, resultados de exames laboratoriais).

**Exemplo da aplicação em JavaScript:**

``` js
const axios = require("axios");

let html = 'https://pulasr-gesthos-api.herokuapp.com/';
// let html = 'http://localhost:3333/'

const criandoJsonAtendimento = () => {
  console.log('ENVIADO ARRAY COM JSONS');
  var obj =
  {
    "credenciais":
    {
      "empresa": "13.025.354/0001-32",
      "usuario": "AABBCCDD",
      "password": "AABBCCDD"
    },
    "pacientes": [
      {
        "internacao": {
          "data": "05/02/2023",
          "hora": "01:37:04",
          "prontuario": "111",
          "atendimento": "111",
          "paciente": "PACIENTE 111",
          "sexo": "F",
          "nascimento": "01/01/1911",
          "unidadeinternacao": "C. T. I.  01",
          "leito": "111"
        }
      },
      {
        "alta": {
          "data": "05/02/2023",
          "hora": "01:37:04",
          "prontuario": "222",
          "atendimento": "222",
          "paciente": "PACIENTE 222",
          "sexo": "F",
          "nascimento": "01/01/1911",
          "unidadeinternacao": "C. T. I.  01",
          "leito": "222"
        }
      },
    ]
  }
  axios.post(html + 'gesthos_atendimentos', obj).then(() => {
    console.log('ENVIADO! ' + JSON.stringify(obj));
  }).catch((err) => console.log(err));
}

const criandoJsonAssistencial = () => {
  console.log('ENVIADO ARRAY COM JSONS');
  var obj =
  {
    "credenciais":
    {
      "empresa": "13.025.354/0001-32",
      "usuario": "AABBCCDD",
      "password": "AABBCCDD"
    },
    "registro": [
      {
        "documento": {
          "data": "01/03/2023",
          "hora": "00:03:06",
          "prontuario": "111",
          "atendimento": "111",
          "grupo": "01 - GRUPO DADOS VITAIS E CONTROLES",
          "item": "0101 - PAS",
          "valor": "120",
        }
      },
      {
        "documento": {
          "data": "01/03/2023",
          "hora": "00:03:06",
          "prontuario": "111",
          "atendimento": "111",
          "grupo": "01 - GRUPO DADOS VITAIS E CONTROLES",
          "item": "0102 - PAD",
          "valor": "80",
        }
      },
    ]
  }

  axios.post(html + 'gesthos_assistencial', obj).then(() => {
    console.log('ENVIADO! ' + JSON.stringify(obj));
  }).catch((err) => console.log(err));
}

setInterval(() => {
  criandoJsonAtendimento();
  criandoJsonAssistencial();
}, 20000);
```

OBS.: esta aplicação é utilizada por mim para testes, e apenas ilustra como se comporta o Robô Gesthos.

<h2>PULSAR</h2>

<h3>ATENDIMENTOS<h3>
A API criada no ambiente Pulsar (API Pulsar) declara a endpoint http://pulsar-gesthos-api.up.railway.app/gesthos_atendimentos. Como explicado acima, quando o robô Gesthos consome esta endpoint, é retornada uma array de JSONs que será armazenada na API pulsar, e posteriormente acessada pelo FrontEnd, pelo método GET, via endpoint http://pulsar-gesthos-api.up.railway.app/pulsar_atendimentos.

Como o robô gestHos envia apenas novos objetos de internação ou alta, faz-se necessário que, a cada consumo (por parte do FrontEnd) da endpoint http://pulsar-gesthos-api.up.railway.app/pulsar_atendimentos, estes objetos sejam devidamente tratados e armazenados no banco de dados do Pulsar. Este processo se dá pelo algoritmo explicado a seguir:

<h4>SITUAÇÃO 01:</h4>
1. Robô Gesthos injeta um objeto de internação.
2. O server Pulsar avalia se o número de atendimento deste objeto já está presente em algum objeto previamente armazenado no banco de dados Pulsar.
3. Em caso afirmativo, o objeto preexistente é deletado e o objeto injetado é armazenado no banco. Isso é necessário, pois em algumas situações um atendimento precisa ser atualizado (mudança de leito do paciente, alteração no nome do paciente ou de algum outro atributo do objeto).
4. Se não existem objetos no banco de dados com o número de atendimento do objeto de internação injetado pelo robô Gesthos, este é simplesmente inserido no banco de dados Pulsar.

<h4>SITUAÇÃO 02:</h4>
1. Robô Gesthos encaminha um objeto de alta.
2. O server Pulsar avalia se o número de atendimento deste objeto está presente em algum objeto previamente armazenado no banco de dados Pulsar (sempre um objeto de internação).
3. Em caso afirmativo, o registro preexistente é deletado, e o objeto de alta injetado descartado.

<h3>ASSISTENCIAL<h3>
A API Pulsar declara também a endpoint http://pulsar-gesthos-api.up.railway.app/gesthos_assistencial. Quando o robô Gesthos consome esta endpoint, é retornada uma array de JSONs contendo registros assistenciais (precauções, alergias, dados vitais, resultados de exames), que serão armazenados no banco de Dados Pulsar.
Os dados assistenciais serão disponibilizados para o FrontEnd através da endpoint http://pulsar-gesthos-api.up.railway.app/lista_assistencial.

**Fragmento do código da API Pulsar (Web Server) explicitando o algoritmo explicado acima:**

``` js
// ## INTEGRAÇÃO GESTHOS ## //
let atendimentos = []; // objetos "atendimento" injetados pelo robô Gesthos.
let assistenciais = []; // objetos "assistenciais" injetados pelo robô Gesthos.
let bd_atendimentos = []; // registros de objetos "atendimento" recuperados do banco de dados Pulsar.
let arrayinternados = [];
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

// funções usadas no mapeamento de objetos de internação e de alta, injetados pelo robô Gesthos.
const checkAtendimentoInternacao = (obj) => {
  // checa se o atendimento injetado com status "internacao" já existia no banco de dados.
  console.log('CHECANDO ATENDIMENTO PRÉVIO');
  if (bd_atendimentos.filter(valor => valor.atendimento == obj.atendimento).length > 0) {
    /* 
    se existia, o registro deve ser deletado e substituído por um novo com o mesmo status "internado".
    isso pode ocorrer nas mudanças de leito ou de outras propriedades do atendimento.
    */
    deleteAtendimento(obj, 1);
  } else {
    insertAtendimento(obj);
  }
}
const checkAtendimentoAlta = (obj) => {
  // checa se o atendimento injetado com status "alta" já existia no banco de dados.
  console.log('CHECANDO ATENDIMENTO PRÉVIO');
  console.log('BANCO: ' + bd_atendimentos.length);
  if (bd_atendimentos.filter(valor => valor.atendimento == obj.atendimento).length > 0) {
    /* 
    se existia, o registro deve ser deletado.
    */
    deleteAtendimento(obj, 0);
  } else {
    console.log('ATENÇÃO: TENTATIVA DE INJETAR OBJETO DE ALTA, SEM CORRESPONDENTE INTERNADO PRÉVIO.')
  }
}

// funções que deletam ou inserem objetos de internação, conforme os resultados das checagens realizadas pelas funções acima.
const deleteAtendimento = (obj, modo) => {
  var sql = "DELETE FROM gesthos_atendimento WHERE atendimento = $1";
  pool.query(sql, [obj.atendimento], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    console.log('REGISTRO DELETADO COM SUCESSO');
    if (modo == 1) {
      insertAtendimento(obj);
    }
  });
}
const insertAtendimento = (obj) => {
  console.log('INSERINDO ATENDIMENTO...');
  var sql = "INSERT INTO gesthos_atendimento (data, hora, prontuario, atendimento, paciente, sexo, nascimento, unidadeinternacao, leito) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)"
  pool.query(sql, [
    obj.data,
    obj.hora,
    obj.prontuario,
    obj.atendimento,
    obj.paciente,
    obj.sexo,
    obj.nascimento,
    obj.unidadeinternacao,
    obj.leito
  ], (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    console.log('REGISTRO DE ATENDIMENTO INSERIDO NO BANCO COM SUCESSO: ' + JSON.stringify(results));
  });
}

// função que insere objeto de registro assistencial no banco de dados Pulsar.
const insertRegistroAssistencial = (obj) => {
  console.log('INSERINDO REGISTRO ASSISTENCIAL...');
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
    console.log('REGISTRO INSERIDO NO BANCO COM SUCESSO: ' + JSON.stringify(results));
  });
}

// injetando objetos de internação e de alta (robô Gesthos >> api Pulsar).
app.post("/gesthos_atendimentos", (req, res) => {
  atendimentos = req.body;
  console.log(atendimentos);
  res.send('SUCESSO');
});

/*
injetando objetos de dados assistenciais (robô Gesthos >> api Pulsar), com gravação dos
mesmos no banco de dados Pulsar.
*/
app.post("/gesthos_assistencial", (req, res) => {
  arrayassistencial = [];
  assistenciais = req.body;
  console.log(assistenciais);
  if (assistenciais == [] || assistenciais == null || assistenciais == undefined || assistenciais == '') {
    console.log('SEM DADOS ENVIADOS PELO BOT GESTHOS');
    res.json({ message: 'SEM DADOS ENVIADOS PELO BOT GESTHOS.', content: assistenciais });
  } else {
    let dados_assistenciais = [];
    dados_assistenciais = assistenciais.registro;
    dados_assistenciais.map(item => arrayassistencial.push(item));
    res.json({ message: 'NOVOS REGISTROS ASSISTENCIAIS:', conteudo: assistenciais.registro });
    // atualizando banco de dados.
    var documentos = arrayassistencial.filter(item => item.hasOwnProperty('documento') == true).length;
    var precaucao = arrayassistencial.filter(item => item.hasOwnProperty('precaucao') == true).length;
    var exame = arrayassistencial.filter(item => item.hasOwnProperty('exame') == true).length;

    console.log(documentos + ' - ' + precaucao + ' - ' + exame);
    arrayassistencial.filter(item => item.hasOwnProperty('documento') == true).map(item => insertRegistroAssistencial(item.documento));
    arrayassistencial.filter(item => item.hasOwnProperty('precaucao') == true).map(item => insertRegistroAssistencial(item.precaucao));
    arrayassistencial.filter(item => item.hasOwnProperty('exame') == true).map(item => insertRegistroAssistencial(item.exame));
  }
});

/*
recuperando objetos no banco de dados Pulsar e tratando inserções ou deleções de registros no banco,
através do mapeamento de cada objeto injetado (api Pulsar >> front Pulsar).
*/
app.get("/pulsar_atendimentos", (req, res) => {
  arrayinternados = [];
  var sql = "SELECT * FROM gesthos_atendimento";
  pool.query(sql, (error, results) => {
    if (error) return res.json({ success: false, message: 'ERRO DE CONEXÃO.' });
    var x = results.rows;
    bd_atendimentos = x;
    console.log(atendimentos);
    if (atendimentos == [] || atendimentos == null || atendimentos == undefined || atendimentos == '') {
      console.log('SEM DADOS ENVIADOS PELO BOT GESTHOS');
      res.json({ message: 'SEM DADOS ENVIADOS PELO BOT GESTHOS.', content: atendimentos });
    } else {
      let internados = [];
      internados = atendimentos.pacientes;
      internados.map(item => arrayinternados.push(item));
      res.json({ message: 'PACIENTES MOVIMENTADOS:', conteudo: atendimentos.pacientes });
      // atualizando banco de dados.
      arrayinternados.filter(item => item.hasOwnProperty('internacao') == true).map(item => checkAtendimentoInternacao(item.internacao));
      arrayinternados.filter(item => item.hasOwnProperty('alta') == true).map(item => checkAtendimentoAlta(item.alta));
    }
  });
});
```
<h2>PRÓXIMOS PASSOS</h2>
1. Sedimentar a integração de alergias, riscos e resultados de exames laboratoriais.
2. Criar endpoint para alimentar o Gesthos com uma evolução livre, criada a partir da concatenação de várias informações presentes na aplicação Pulsar.
3. Substituir os caminhos das endpoints no FrontEnd Pulsar por variáveis de ambiente (segurança).
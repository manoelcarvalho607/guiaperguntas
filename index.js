const express = require("express");
const app = express();
const bodyParser = require("body-parser"); //bodyparser é responsável por pegar o conteúdo do formulário e traduzir numa estrutura JS.
const connection = require("./database/database");
const Pergunta = require("./database/Pergunta");
const Resposta = require("./database/Resposta");


//Database

connection
    .authenticate()
    .then(() => {
        console.log("Conexão feita com o banco de dados!")
    })
    .catch((msgErro) => {
        console.log(msgErro)
    })

// dizendo para o Express usar o EJS como View engine - redenrizador html
app.set('view engine', 'ejs');
// arquivos estáticos 
app.use(express.static('public'));


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json()); // ler dados de formulário enviado via json

//Rotas
app.get("/", (req, res) => {
    Pergunta.findAll({
        raw: true, order: [
            ['id', 'DESC'] //ASC = Crescente || DESC = Decrescente
        ]
    }).then(perguntas => {
        res.render("index", {
            perguntas: perguntas
        });
    })

});

app.get("/perguntar", (req, res) => {
    res.render("perguntar");
});

app.post("/salvarpergunta", (req, res) => {
    var titulo = req.body.titulo;
    var descricao = req.body.descricao;
    Pergunta.create({
        titulo: titulo,
        descricao: descricao
    }).then(() => {
        res.redirect("/");
        console.log("Dados salvos com sucesso no banco de dados!");
    }).catch((err) => {
        console.log("Erro ao inserir dados" + err)
    });
});

app.get("/pergunta/:id", (req, res) => {
    var id = req.params.id;
    Pergunta.findOne({
        where: { id: id }
    }).then(pergunta => {
        if (pergunta != undefined) { //Pergunta encontrada

            Resposta.findAll({
                where: { perguntaId: pergunta.id }
            }).then(respostas => {
                res.render('pergunta', {
                    pergunta: pergunta,
                    respostas: respostas
                });
            });
        } else { // Não encontrada
            res.redirect("/");
        }
    });
})



app.post("/responder", (req, res) => {
    var corpo = req.body.corpo;
    var perguntaId = req.body.pergunta;
    Resposta.create({
        corpo: corpo,
        perguntaId: perguntaId
    }).then(() => {
        res.redirect("/pergunta/" + perguntaId)

    }).catch((err) => {
        res.redirect("/");
    })
});


app.listen(8080, () => {
    console.log("app rodando!");
});

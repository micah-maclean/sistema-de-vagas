const BASE_URL = 'http://localhost:3000';
class Usuario {
    id;
    tipo;
    nome;
    dataNascimento; // salvar como objeto Date e não como string '10/05/1990' por exemplo
    email;
    senha;
    candidaturas = []; // lista de Candidatura

    constructor(tipo, nome, dataNascimento, email, senha) {
        this.tipo = tipo;
        this.nome = nome;
        this.dataNascimento = dataNascimento;
        this.email = email;
        this.senha = senha;
    }
}

class Candidatura {
    idVaga;
    idCandidato;
    reprovado = false; 

    constructor(idCandidato, idVaga) {
        this.idCandidato = idCandidato;
        this.idVaga = idVaga;
    }
}

class Vaga {
    id; 
    titulo;
    descrição;
    remuneracao;
    candidatos = []; 

    constructor(titulo, descricao, remuneracao) {
        this.titulo = titulo;
        this.descricao = descricao;
        this.remuneracao = remuneracao;
    }
}

class Validador {

    ehNomeValido ( str ){
        const strSemEspaco = str.replaceAll(' ', '');

        return strSemEspaco.split('').every( c =>{ c.toLowerCase() !== c.toUpperCase()})
    }

    ehEmailValido( str ){
        let [usuario, dominio] = str.split('@');

        if(usuario.length <= 2 || !dominio) return false;

        if(dominio.split('.')[0].length < 3 || !dominio.split('.').every(cd => cd.length >= 2 )) {
            return false;
        }

        return true;
    }

    ehSenhaValida( str ){
        let ehLetraMinuscula = 0;
        let ehLetraMaiuscula = 0;
        let ehCaracterEspecial = 0;
        let ehNumero = 0;

        if (!str.lenght >= 8) return false;

        str.split('').forEach( caracter => {
            if(caracter.toLowerCase() === caracter.toUpperCase()){
                return ( !isNaN( parseInt(caracter)) ) ? ehNumero++ : ehCaracterEspecial++;
            } 
            
            return (caracter.toUpperCase() === caracter ) ? ehLetraMaiuscula++ : ehLetraMinuscula++;  
        });

        return (ehLetraMaiuscula && ehLetraMinuscula && ehCaracterEspecial && ehNumero) ? true : false; 
    }

    ehIdadeValida(str){
        const hoje = new Date();
        let [dia, mes, ano] = str.split('/');
        const dataNascimento = new Date(ano, parseInt(mes) - 1, dia);

        if(dia > 31 || mes > 12 || isNaN(dataNascimento)){
            return;
        }

        let idade = hoje.getFullYear() - dataNascimento.getFullYear();
        if(hoje.getMonth < dataNascimento.getMonth || (hoje.getMonth === dataNascimento.getMonth &&  hoje.getDay() < dataNascimento.getDay )) {
            idade--;
        }

        return idade >= 18 ? true : false;
    }
}

const validador = new Validador();
const btnLogin = document.getElementById('btn-login');
const senhaEsquecida= document.getElementById('senha-esquecida');
const novoUsuario = document.getElementById('novo-usuario');
const btnCadastroUsuario = document.getElementById('btn-cadastro-usuario')

const login = (event) =>{
    event.preventDefault()
    const email = document.getElementById('email-login').value;
    const senha = document.getElementById('senha-login').value;
    console.log(`Email: ${email} + Senha: ${senha}`)
    
    axios.get(`${BASE_URL}/usuarios`)
   .then( response => {
        let usuarios = response.data
        console.log(usuarios)
   })
   .catch(error => {
        alert('Usuario não encontrado');
        console.log(error);
    });
}

const esqueceuSenha = () => {
    const email = prompt('Digite o email:');

    axios.get(`${BASE_URL}/usuarios/${email}`)
   .then( response => {
        const senha = response.data.senha;
        alert(`A senha do usuario(${email}) é: ${senha}`)
   })
   .catch(error => {
        alert('Usuario não encontrado');
        console.log(error);
    });
}

const mudarParaTelaCadastroUsuario = () => {
    const telaLogin = document.getElementById('login');
    const telaNovoUsuario = document.getElementById('cadastro-usuario');
    
    telaLogin.classList.add('nao-visivel');
    telaNovoUsuario.classList.remove('nao-visivel');
}

const cadastroUsuario = () =>{
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const tipo = document.getElementById('tipo');
    const senha = document.getElementById('senha').value;
    const dataNascimento = document.getElementById('data-de-nascimento').value;

    const telaLogin = document.getElementById('login')
    const telaNovoUsuario = document.getElementById('cadastro-usuario')

    
    if(nome === '' || validador.ehNomeValido(nome)) {
        alert('Nome invalido.')
        return;
    } else if(!validador.ehEmailValido(email)) {
        alert('Email invalido')
        return;
    } else if(!validador.ehIdadeValida(dataNascimento)) {
        alert('Data Invalida')
        return;
    } else if(!validador.ehSenhaValida(senha)) {
        alert('Senha invalida')
        return;
    }

    const nomeCapitalize = titleCase(nome)
    const dataIso = formataData(dataNascimento);
    const tipoSelecionado = tipo.options[tipo.selectedIndex].value
    const usuario = new Usuario(tipoSelecionado, nomeCapitalize, dataIso, email, senha);

    axios.post(`${BASE_URL}/usuarios`, usuario)
    .then( () =>{        
        alert('Usuário cadastrado com sucesso');
        telaLogin.classList.remove('nao-visivel');
        telaNovoUsuario.classList.add('nao-visivel');
    })
    .catch( error => {
        console.log(error)
    });


}

const cadastroVaga = () => {

}

const listaVaga = () => {

}

const detalheVaga = () => {

}

const titleCase = str => {
    return str.split(' ').map(p => p[0].toUpperCase() + p.substr(1).toLowerCase()).join(' ');
}

const formataData = str => {
    const [dia, mes, ano] = str.split('/');

    return new Date(ano, mes, dia);
}

btnLogin.addEventListener('click', login);
senhaEsquecida.addEventListener('click', esqueceuSenha);
novoUsuario.addEventListener('click' , mudarParaTelaCadastroUsuario);
btnCadastroUsuario.addEventListener('click', cadastroUsuario)
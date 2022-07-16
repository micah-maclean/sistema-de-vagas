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

class Candidatura{
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
const novaVaga = document.getElementById('nova-vaga');
const btnCadastroUsuario = document.getElementById('cadastrar-usuario');
const btnCadastroVaga = document.getElementById('cadastrar-vaga');
const dataInput = document.getElementById('data-de-nascimento');

const login = (event) =>{
    event.preventDefault()
    const email = document.getElementById('email-login').value;
    const senha = document.getElementById('senha-login').value;
    
    axios.get(`${BASE_URL}/usuarios/?email=${email}`)
   .then( response => {
        const usuario = response.data[0]
        const senhaDb = usuario.senha;

        if(senhaDb !== senha){
            alert('Senha Incorreta.');
            return;
        }

        listaVagas(usuario);
        mudarTela(event);        
   })
   .catch(error => {
        alert('Usuario não encontrado');
        console.log(error);
    });
}

const esqueceuSenha = () => {
    const email = prompt('Digite o email:');

    axios.get(`${BASE_URL}/usuarios/?email=${email}`)
   .then( response => {
        const senha = response.data[0].senha;
        alert(`A senha do usuario é: ${senha}`)
   })
   .catch(error => {
        alert('Usuario não encontrado');
        console.log(error);
    });
}

// const mudarParaTelaCadastroUsuario = () => {
//     const telaLogin = document.getElementById('login');
//     const telaNovoUsuario = document.getElementById('cadastro-usuario');
    
//     telaLogin.classList.add('nao-visivel');
//     telaNovoUsuario.classList.remove('nao-visivel');
// }


const mudarTela = (event) => {
    const telaAtual = event.target.id;

    const telaLogin = document.getElementById('login');
    const telaNovoUsuario = document.getElementById('cadastro-usuario');
    const telaNovaVaga = document.getElementById('cadastro-vaga');
    const telaListaVaga = document.getElementById('lista-vagas');

    switch(telaAtual){
        case 'btn-login':
            telaLogin.classList.add('nao-visivel');
            telaListaVaga.classList.remove('nao-visivel');
            break;
        case 'novo-usuario':
            telaLogin.classList.add('nao-visivel');
            telaNovoUsuario.classList.remove('nao-visivel');
            break;
        case 'cadastrar-usuario': 
            telaLogin.classList.remove('nao-visivel');
            telaNovoUsuario.classList.add('nao-visivel');
            break;
        case 'nova-vaga':
            telaListaVaga.classList.add('nao-visivel')
            telaNovaVaga.classList.remove('nao-visivel')
            break;
        case 'cadastrar-vaga':
            telaListaVaga.classList.remove('nao-visivel')
            telaNovaVaga.classList.add('nao-visivel')
            break;
    }
}

const cadastroUsuario = (event) =>{
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const tipo = document.getElementById('tipo');
    const senha = document.getElementById('senha').value;
    const dataNascimento = document.getElementById('data-de-nascimento').value;

    const telaLogin = document.getElementById('login')
    const telaNovoUsuario = document.getElementById('cadastro-usuario')

    
    if(!nome || validador.ehNomeValido(nome)) {
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
        mudarTela(event)
    })
    .catch( error => {
        console.log(error)
    });
}

const cadastroVaga = (event) => {
    const titulo = document.getElementById('titulo').value;
    const descricao = document.getElementById('descricao').value;
    const remuneracao = document.getElementById('remuneracao').value;

    if(!titulo || !descricao || !remuneracao) {
        alert('Todos os campos tem que ser preenchido')
        return;
    }

    const vaga = new Vaga(titulo, descricao, remuneracao)
    axios.post(`${BASE_URL}/vagas`, vaga)
    .then(() => {
        mudarTela(event)
        listaVagas("Recrutador")
    })
    .catch(error => {
        console.log(error)
    })

}

const listaVagas = usuario => {
    const ul = document.getElementById('ul-vagas');
    let filho = ul.lastElementChild;
    while(filho){
        filho.remove();
        filho = ul.lastElementChild;
    }

    if(usuario.tipo === "Trabalhador"){
        const telaListaVaga = document.getElementById('lista-vagas');
        telaListaVaga.classList.add('trabalhador')
        const btnVagas = document.getElementById('nova-vaga');
        btnVagas.classList.add('nao-visivel');
    }


    axios.get(`${BASE_URL}/vagas`)
    .then( response => {
        const ul = document.getElementById('ul-vagas');

        response.data.forEach( vaga => {
            const li = document.createElement('li');
            const titulo = document.createElement('p');
            const remuneracao = document.createElement('p');
            const tituloSpan = document.createElement('span');
            const remuneracaoSpan = document.createElement('span');

            titulo.textContent = 'Título: ';
            remuneracao.textContent = 'Remuneração: ';
            tituloSpan.textContent = vaga.titulo;
            remuneracaoSpan.textContent = vaga.remuneracao;

            titulo.append(tituloSpan);
            remuneracao.append(remuneracaoSpan);
            li.append(titulo, remuneracao);

            li.addEventListener('click', () => {detalheVaga(usuario, vaga);});

            ul.append(li);            
        })
    })
    .catch( error => {
        console.log(error);
    })
}

const detalheVaga = (usuario, vaga) => {
    const telaListaVaga = document.getElementById('lista-vagas');
    const telaDetalheVaga = document.getElementById('descricao-vaga');

    telaListaVaga.classList.add('nao-visivel');
    telaDetalheVaga.classList.remove('nao-visivel');

    const tituloSpan = document.getElementById('titulo-span');
    const descricaoSpan = document.getElementById('descricao-span');
    const remuneracaoSpan = document.getElementById('remuneracao-span');

    tituloSpan.textContent = vaga.titulo;
    descricaoSpan.textContent = vaga.descricao;
    remuneracaoSpan.textContent = vaga.remuneracao;

    if(usuario.tipo === "Recrutador"){
        const tabela = document.getElementById('tabela');
        tabela.classList.add('recrutador')
    }

    if(usuario.tipo === "Trabalhador"){
        const btnCandidatar = document.getElementById('botao-descricao');
        btnCandidatar.textContent = 'Candidatar-se';
        axios.get(`${BASE_URL}/vagas/${vaga.id}`)
        .then( response => {
            console.log(response.data)
            if(response.data.candidatos.some(c => c.id === usuario.id)) btnCandidatar.setAttribute('disabled', true);
        }).catch( error => console.log(error));

        btnCandidatar.addEventListener('click', () => adicionarCandidatura(usuario, vaga)) 
    }

}

const adicionarCandidatura = (usuario, vaga) => {
    const candidatura = new Candidatura(usuario.id, vaga.id);

    usuario.candidaturas.push(candidatura);
    vaga.candidatos.push(usuario);
    axios.put(`${BASE_URL}/usuarios/${usuario.id}` , usuario)
    .then(alert('Sucesso usuario'))
    .catch(error => console.log(error));

    axios.put(`${BASE_URL}/vagas/${vaga.id}` , vaga)
    .then(alert('Sucesso'))
    .catch(error => console.log(error));

}

const titleCase = str => {
    return str.split(' ').map(p => p[0].toUpperCase() + p.substr(1).toLowerCase()).join(' ');
}

const adicionarMascaraData = () => {
    const dataInput = document.getElementById('data-de-nascimento');
    let data = dataInput.value.replaceAll(' ', '').replaceAll('/', ''); 

    switch(data.length) {
      case 3: case 4:
        dataInput.value = `${data.substring(0,2)}/${data.substring(2)}`;
        break;
      case 5: case 6: case 7: case 8:
        dataInput.value = `${data.substring(0,2)}/${data.substring(2,4)}/${data.substring(4)}`;
        break;
      default:
        dataInput.value = data;
    }
}

const formataData = str => {
    const [dia, mes, ano] = str.split('/');

    return new Date(ano, mes, dia);
}

btnLogin.addEventListener('click', login);
senhaEsquecida.addEventListener('click', esqueceuSenha);
// novoUsuario.addEventListener('click' , mudarParaTelaCadastroUsuario);
novoUsuario.addEventListener('click', mudarTela);
novaVaga.addEventListener('click', mudarTela)
btnCadastroVaga.addEventListener('click', cadastroVaga);
btnCadastroUsuario.addEventListener('click', cadastroUsuario);
dataInput.addEventListener('keyup', adicionarMascaraData);

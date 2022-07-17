const BASE_URL = 'http://localhost:3000';
class Usuario {
    id;
    tipo = '';
    nome = '';
    dataNascimento = null; // salvar como objeto Date e não como string '10/05/1990' por exemplo
    email = '';
    senha = '';
    candidaturas = []; // lista de Candidatura

    constructor(tipo, nome, dataNascimento, email, senha) {
        this.tipo = tipo ? tipo : this.tipo;
        this.nome = nome ? nome : this.nome;
        this.dataNascimento = dataNascimento ? dataNascimento : this.dataNascimento;
        this.email = email ? email : this.email;
        this.senha = senha ? senha : this.senha;
    }
}

class Candidatura {
    idVaga = null;
    idCandidato = null;
    reprovado = false;

    constructor(idCandidato, idVaga, reprovado) {
        this.idCandidato = idCandidato ? idCandidato : this.idCandidato;
        this.idVaga = idVaga ? idVaga : this.idVaga;
        this.reprovado = reprovado ? reprovado : this.reprovado;
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

    ehNomeValido(str) {
        const strSemEspaco = str.replaceAll(' ', '');

        return strSemEspaco.split('').every(c => {
            c.toLowerCase() !== c.toUpperCase()
        })
    }

    ehEmailValido(str) {
        let [usuario, dominio] = str.split('@');

        if (usuario.length <= 2 || !dominio) return false;

        if (dominio.split('.')[0].length < 3 || !dominio.split('.').every(cd => cd.length >= 2)) {
            return false;
        }

        return true;
    }

    ehSenhaValida(str) {
        let ehLetraMinuscula = 0;
        let ehLetraMaiuscula = 0;
        let ehCaracterEspecial = 0;
        let ehNumero = 0;

        if (!str.lenght >= 8) return false;

        str.split('').forEach(caracter => {
            if (caracter.toLowerCase() === caracter.toUpperCase()) {
                return (!isNaN(parseInt(caracter))) ? ehNumero++ : ehCaracterEspecial++;
            }

            return (caracter.toUpperCase() === caracter) ? ehLetraMaiuscula++ : ehLetraMinuscula++;
        });

        return (ehLetraMaiuscula && ehLetraMinuscula && ehCaracterEspecial && ehNumero) ? true : false;
    }

    ehIdadeValida(str) {
        const hoje = new Date();
        let [dia, mes, ano] = str.split('/');
        const dataNascimento = new Date(ano, parseInt(mes) - 1, dia);

        if (dia > 31 || mes > 12 || isNaN(dataNascimento)) {
            return;
        }

        let idade = hoje.getFullYear() - dataNascimento.getFullYear();
        if (hoje.getMonth < dataNascimento.getMonth || (hoje.getMonth === dataNascimento.getMonth && hoje.getDay() < dataNascimento.getDay)) {
            idade--;
        }

        return idade >= 18 ? true : false;
    }
}

const validador = new Validador();
const btnLogin = document.getElementById('btn-login');
const senhaEsquecida = document.getElementById('senha-esquecida');
const novoUsuario = document.getElementById('novo-usuario');
const novaVaga = document.getElementById('nova-vaga');
const btnCadastroUsuario = document.getElementById('cadastrar-usuario');
const btnCadastroVaga = document.getElementById('cadastrar-vaga');
const dataInput = document.getElementById('data-de-nascimento');
const btnDeslogar = document.getElementById('deslogar')
const remuneracaoInput = document.getElementById('remuneracao')
const btnVoltarCadastroUsuario = document.getElementById('voltar-login')
const btnVoltarCadastroVaga = document.getElementById('voltar-lista')
const btnVoltarDetalhe = document.getElementById('voltar-para-lista')

const login = (event) => {
    const email = document.getElementById('email-login');
    const senha = document.getElementById('senha-login');

    axios.get(`${BASE_URL}/usuarios/?email=${email.value}`)
        .then(response => {
            const usuario = response.data[0]
            const senhaDb = usuario.senha;

            if (senhaDb !== senha.value) {
                alert('Senha Incorreta.');
                return;
            }
            listaVagas(usuario);
            mudarTela(event);
            email.value = ''
            senha.value = ''
        })
        .catch(error => {
            alert('Usuario não encontrado');
            console.log(error);
        });
}

const esqueceuSenha = () => {
    const email = prompt('Digite o email:');

    axios.get(`${BASE_URL}/usuarios/?email=${email}`)
        .then(response => {
            const senha = response.data[0].senha;
            alert(`A senha do usuario é: ${senha}`)
        })
        .catch(error => {
            alert('Usuario não encontrado');
            console.log(error);
        });
}

const mudarTela = (event) => {
    const telaAtual = event.target.id;

    const telaLogin = document.getElementById('login');
    const telaNovoUsuario = document.getElementById('cadastro-usuario');
    const telaNovaVaga = document.getElementById('cadastro-vaga');
    const telaListaVaga = document.getElementById('lista-vagas');
    const telaDetalheVaga = document.getElementById('descricao-vaga')

    switch (telaAtual) {
        case 'btn-login':
            telaLogin.classList.add('nao-visivel');
            telaListaVaga.classList.remove('nao-visivel');
            break;
        case 'novo-usuario':
            telaLogin.classList.add('nao-visivel');
            telaNovoUsuario.classList.remove('nao-visivel');
            break;
        case 'cadastrar-usuario': case 'voltar-login':
            telaLogin.classList.remove('nao-visivel');
            telaNovoUsuario.classList.add('nao-visivel');
            break;
        case 'nova-vaga':
            telaListaVaga.classList.add('nao-visivel');
            telaNovaVaga.classList.remove('nao-visivel');
            break;
        case 'cadastrar-vaga': case 'voltar-lista':
            telaListaVaga.classList.remove('nao-visivel');
            telaNovaVaga.classList.add('nao-visivel') ;
            break;
        case 'deslogar':
            telaListaVaga.classList.add('nao-visivel');
            telaLogin.classList.remove('nao-visivel');
            break;
        case 'voltar-para-lista': case 'deleta-vaga':
            telaListaVaga.classList.remove('nao-visivel');
            telaDetalheVaga.classList.add('nao-visivel');
            break;
    }
}

const cadastroUsuario = event => {
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const tipo = document.getElementById('tipo');
    const senha = document.getElementById('senha').value;
    const dataNascimento = document.getElementById('data-de-nascimento').value;

    if (!nome || validador.ehNomeValido(nome)) {
        alert('Nome invalido.')
        return;
    } else if (!validador.ehEmailValido(email)) {
        alert('Email invalido')
        return;
    } else if (!validador.ehIdadeValida(dataNascimento)) {
        alert('Data Invalida')
        return;
    } else if (!validador.ehSenhaValida(senha)) {
        alert('Senha invalida')
        return;
    }

    const nomeCapitalize = titleCase(nome)
    const dataIso = formatarData(dataNascimento);
    const tipoSelecionado = tipo.options[tipo.selectedIndex].value
    const usuario = new Usuario(tipoSelecionado, nomeCapitalize, dataIso, email, senha);

    axios.post(`${BASE_URL}/usuarios`, usuario)
        .then(() => {
            alert('Usuário cadastrado com sucesso');
            mudarTela(event);
        })
        .catch(error => console.log(error));
}

const cadastroVaga = event => {
    const titulo = document.getElementById('titulo').value;
    const descricao = document.getElementById('descricao').value;
    const remuneracao = document.getElementById('remuneracao').value;
    
        if (!titulo || !descricao || !remuneracao) {
            alert('Todos os campos tem que ser preenchido')
            return;
        }
    
        const vaga = new Vaga(titulo, descricao, remuneracao)
        axios.post(`${BASE_URL}/vagas`, vaga)
            .then(() => {
                listaVagas("Recrutador")
                mudarTela(event)
            })
            .catch(error => {
                console.log(error)
            })
           
  
}

const listaVagas = usuario => {
    const ul = document.getElementById('ul-vagas');
    let filho = ul.lastElementChild;
    while (filho) {
        filho.remove();
        filho = ul.lastElementChild;
    }

    const telaListaVaga = document.getElementById('lista-vagas');
    const btnVagas = document.getElementById('nova-vaga');

    if (usuario.tipo === "Trabalhador") {
        telaListaVaga.classList.add('trabalhador')
        btnVagas.classList.add('nao-visivel');
    } else {
        telaListaVaga.classList.remove('trabalhador')
        btnVagas.classList.remove('nao-visivel');
    }

    axios.get(`${BASE_URL}/vagas`)
        .then(response => {
            const ul = document.getElementById('ul-vagas');

            response.data.forEach(vaga => {
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

                li.addEventListener('click', () => {
                    detalheVaga(usuario, vaga);
                });

                ul.append(li);
            })
        })
        .catch(error => {
            console.log(error);
        })
}

const detalheVaga = (usuario, vaga) => {
    const telaListaVaga = document.getElementById('lista-vagas');
    const telaDetalheVaga = document.getElementById('descricao-vaga');
    const tabela = document.getElementById('tabela');

    telaListaVaga.classList.add('nao-visivel');
    telaDetalheVaga.classList.remove('nao-visivel');
    tabela.classList.remove('recrutador')

    const tituloSpan = document.getElementById('titulo-span');
    const descricaoSpan = document.getElementById('descricao-span');
    const remuneracaoSpan = document.getElementById('remuneracao-span');

    const div = document.getElementById('div-botoes');
    if(div.childElementCount > 1) div.lastElementChild.remove();
    const btnDescricao = document.createElement('button');
    div.append(btnDescricao);

    tituloSpan.textContent = vaga.titulo;
    descricaoSpan.textContent = vaga.descricao;
    remuneracaoSpan.textContent = vaga.remuneracao;

    if (usuario.tipo === "Recrutador") {
        btnDescricao.textContent = 'Excluir Vaga'
        btnDescricao.setAttribute('id', 'deleta-vaga');
        btnDescricao.addEventListener('click', () => excluirVaga(event, usuario, vaga));
        tabela.classList.add('recrutador')
    }

    if (usuario.tipo === "Trabalhador") {
        if (vaga.candidatos.some(c => c.id === usuario.id)) {
            btnDescricao.textContent = 'Cancelar Candidatura';
            btnDescricao.addEventListener('click', () => cancelarCandidatura(usuario, vaga));
        } else {
            btnDescricao.textContent = 'Candidatar-se';
            btnDescricao.addEventListener('click', () => adicionarCandidatura(usuario, vaga));
        }
    }

    let filho = tabela.lastElementChild;
    while (tabela.childElementCount > 1) {
        filho.remove();
        filho = tabela.lastElementChild;
    }

    vaga.candidatos.forEach(candidato => {
        const li = document.createElement('li');
        const nomeSpan = document.createElement('span');
        const dataSpan = document.createElement('span');


        nomeSpan.textContent = candidato.nome;
        dataSpan.textContent = formatarDataIso(candidato.dataNascimento);


        li.append(nomeSpan, dataSpan);
        if(usuario.tipo === 'Trabalhador'){
            candidato.candidaturas.forEach(candidatura => {
                if (candidatura.idVaga === vaga.id && candidatura.reprovado === true && candidato.id === usuario.id) {
                    console.log(usuario.nome)
                    nomeSpan.style.color = '#E53636';
                    btnDescricao.setAttribute('disabled', true);
                }
            })
        }

        if (usuario.tipo === 'Recrutador') {
            const reprovar = document.createElement('button');
            reprovar.textContent = 'Reprova'
            candidato.candidaturas.forEach(candidatura => {
                if (candidatura.idVaga === vaga.id && candidatura.reprovado === true) return reprovar.setAttribute('disabled', true);
            })

            reprovar.addEventListener('click', () => {
                reprovarCandidato(usuario, candidato, vaga);
            });
            li.append(reprovar);
        }

        tabela.append(li);
    })

}

const adicionarCandidatura = (usuario, vaga) => {
    const candidatura = new Candidatura(usuario.id, vaga.id);

    usuario.candidaturas.push(candidatura);
    vaga.candidatos.push(usuario);
    const adicionouCandidatura = axios.put(`${BASE_URL}/usuarios/${usuario.id}`, usuario)
        .then(() => {
            return true
        })
        .catch(error => {console.log(error); return false;});

    // const usuarioSimplificado = {nome: usuario.nome, dataNascimento : usuario.dataNascimento, idCandidato:usuario.id} //TODO
    const adicionouCandidato = axios.put(`${BASE_URL}/vagas/${vaga.id}`, vaga)
        .then(() => {
            return true
        })
        .catch(error => {console.log(error); return false;});

    detalheVaga(usuario, vaga)
    return adicionouCandidato && adicionouCandidatura ? alert('Candidatura adicionado com sucesso') : alert('Não foi possível adicionar candidatura');
}

const reprovarCandidato = (usuario, candidato, vaga) => {
    const confirmaReprovacao = confirm(`Tem certeza que quer reprovar ${candidato.nome}?`);

    if (!confirmaReprovacao) return;

    const novoStatus = new Candidatura(candidato.id, vaga.id, true);

    candidato.candidaturas = candidato.candidaturas.map(candidatura => {
        return (candidatura.idVaga === vaga.id) ? novoStatus : candidatura;
    })

    const reprovouCandidatura = axios.put(`${BASE_URL}/usuarios/${candidato.id}`, candidato)
        .then(() => { return true })
        .catch(error => {console.log(error); return false;});


    vaga.candidatos = vaga.candidatos.map(c => {
        return (c.id === candidato.id) ? candidato : c;
    })

    const reprovouCandidato = axios.put(`${BASE_URL}/vagas/${vaga.id}`, vaga)
        .then(() => { return true })
        .catch(error => {console.log(error); return false;});

    
    detalheVaga(usuario, vaga)
    return reprovouCandidato && reprovouCandidatura ? alert('Candidatura reprovada com sucesso') : alert('Não foi possível reprovar a candidatura');
}

const cancelarCandidatura = (usuario, vaga) => {
    const confirmaCancelamento = confirm(`Tem certeza que quer cancelar candidatura?`);

    if (!confirmaCancelamento) return;

    usuario.candidaturas = usuario.candidaturas.filter( candidatura => candidatura.idVaga !== vaga.id);
    vaga.candidatos = vaga.candidatos.filter( candidato => candidato.id !== usuario.id)

    const cancelouCandidato = axios.put(`${BASE_URL}/usuarios/${usuario.id}`, usuario)
        .then(() => { return true })
        .catch(error => {console.log(error); return false;});

    const cancelouCandidatura = axios.put(`${BASE_URL}/vagas/${vaga.id}`, vaga)
        .then(() => { return true })
        .catch(error => {console.log(error); return false;});

    

    detalheVaga(usuario, vaga)
    return cancelouCandidato && cancelouCandidatura ? alert('Candidatura cancelada com sucesso') : alert('Não foi possível cancelar a candidatura');

}

const excluirVaga = (evento,  usuario, vaga) => {
    axios.delete(`${BASE_URL}/vagas/${vaga.id}`)
    .then(alert('Vaga excluida com sucesso.'))
    .catch( error => console.log(error))

    listaVagas(usuario);
    mudarTela(evento);
}
const titleCase = str => {
    return str.split(' ').map(p => p[0].toUpperCase() + p.substr(1).toLowerCase()).join(' ');
}

const adicionarMascaraData = () => {
    const dataInput = document.getElementById('data-de-nascimento');
    let data = dataInput.value.replaceAll(' ', '').replaceAll('/', '');

    switch (data.length) {
        case 3:
        case 4:
            dataInput.value = `${data.substring(0,2)}/${data.substring(2)}`;
            break;
        case 5:
        case 6:
        case 7:
        case 8:
            dataInput.value = `${data.substring(0,2)}/${data.substring(2,4)}/${data.substring(4)}`;
            break;
        default:
            dataInput.value = data;
    }
}

const formatarData = str => {
    const [dia, mes, ano] = str.split('/');

    return new Date(ano, mes, dia);
}

const formatarDataIso = str => {
    const [ano, mes, dia] = str.split('T')[0].split('-');
    
    return `${dia}/${mes}/${ano}`;
}

const adicionarMascaraCifrao = () => {
    const remuneracaoInput = document.getElementById('remuneracao')
    let remuneracao = remuneracaoInput.value.replaceAll(' ', '')

    switch (remuneracao.length) {
        case 0:
            remuneracaoInput.value = `R$${remuneracao.substring(2)}`;
            break;
        default:
            remuneracaoInput.value = remuneracao;
    }
}

btnLogin.addEventListener('click', login);
senhaEsquecida.addEventListener('click', esqueceuSenha);
novoUsuario.addEventListener('click', mudarTela);
novaVaga.addEventListener('click', mudarTela)
btnDeslogar.addEventListener('click', mudarTela);
btnVoltarCadastroUsuario.addEventListener('click', mudarTela);
btnVoltarCadastroVaga.addEventListener('click', mudarTela);
btnVoltarDetalhe.addEventListener('click', mudarTela);
btnCadastroVaga.addEventListener('click', cadastroVaga);
btnCadastroUsuario.addEventListener('click', cadastroUsuario);
dataInput.addEventListener('keyup', adicionarMascaraData);
remuneracaoInput.addEventListener('keydown', adicionarMascaraCifrao)
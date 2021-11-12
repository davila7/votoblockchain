async function loadWeb3(){
    if(window.ethereum){
      window.web3 = new Web3(window.ethereum);
      window.ethereum.enable();
    }
    else{
      alert('Ups! Debes instalar Metamask para continuar.')
    }
}

async function loadContract(){
    //set Abi
    var abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"Ganador","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_nombrePersona","type":"string"},{"internalType":"uint256","name":"_edad","type":"uint256"},{"internalType":"string","name":"_idPersona","type":"string"}],"name":"Representar","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"VerCandidatos","outputs":[{"internalType":"string[]","name":"","type":"string[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"VerResultados","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_candidato","type":"string"}],"name":"VerVotos","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_candidato","type":"string"}],"name":"Votar","outputs":[],"stateMutability":"nonpayable","type":"function"}];

    //set address
    var address = "0x8e02569A7d0cb806CdEc1E4419eFb8dDC30237Fd";
      console.log(window.web3);
    return await new window.web3.eth.Contract(abi,address);
}

async function getCurrentAccount(){
    const accounts = await window.web3.eth.getAccounts();
    if(accounts.length > 0)
    {
      $('#div_cuenta').show();
      $('#current_address').text(accounts[0]);
    }
    return accounts[0];
  }

async function load(){
      await loadWeb3();
      await getCurrentAccount();
      window.contract = await loadContract();
      VerDashboard();
      console.log('ready');
}

async function VerCandidatos(){
  const candidatos = await window.contract.methods.VerCandidatos().call();
  showDiv('.div_candidatos');
  console.log(candidatos);
  $('#tbody_candidatos').empty();
  for(i = 0; i < candidatos.length; i++)
  {
    console.log();
    $('#tbody_candidatos').append('<tr><td>'+candidatos[i]+'</td></tr>');
  }

}

async function VerGanador(){
  const ganador = await window.contract.methods.Ganador().call();
  const votos_ganador = await window.contract.methods.VerVotos(ganador).call();

  showDiv('.div_ganador');
  $('#ganador').text(ganador+' Votos:'+votos_ganador);

}

async function VerDashboard(){
  const resultados = await window.contract.methods.VerResultados().call();
  const myArr = resultados.split("----");
  let labels = [];
  let values = [];
  let total_array = [];
  $('#lista_candidatos_votos').empty();
  for(i=0;i<myArr.length;i++){
      if(myArr[i] != ''){
        let result = myArr[i].replace("(", "").replace(")", "");
        const result_array = result.split(",");
        labels.push(result_array[0]);
        values.push(result_array[1]);
        total_array.push(result_array);
      }
  }
  
  total_array.sort(function(a,b) {
      return b[1] - a[1];
  });
  console.log(total_array);
  for(i=0;i<total_array.length;i++){
    string = '<li class="list-group-item d-flex justify-content-between align-items-center">'+total_array[i][0]+'<span class="badge badge-primary badge-pill">'+total_array[i][1]+'</span></li>';
    $('#lista_candidatos_votos').append(string);
  }
  

  var ctx = document.getElementById("myChart");
  var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        lineTension: 0,
        backgroundColor: 'transparent',
        borderColor: '#007bff',
        borderWidth: 4,
        pointBackgroundColor: '#007bff'
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: false
          }
        }]
      },
      legend: {
        display: false,
      }
    }
  });

  showDiv('.div_dashboard');
  //console.log(resultados);
}

function ShowAgregarCandidato(){
  showDiv('.div_agregar_candidato');
}

async function AgregarCandidato(){
  const candidatos = await window.contract.methods.VerCandidatos().call();
  const account = await getCurrentAccount();
  if(account != '0x9b26f31BA462818BE0405DC12fd374C482DE2A43')
  {
    alert('Ups! Solo el creador de este Smart Contract puede registrar candidatos');
    return false;
  }

  const add_candidato = await window.contract.methods.Representar($('#name').val(), $('#edad').val(), candidatos.length).send({ from: account});
  //showDiv('.div_dashboard');
  console.log(add_candidato);
}

async function ShowVotar(){
  const candidatos = await window.contract.methods.VerCandidatos().call();
  $('#radio_candidatos').empty();
  for(i=0;i<candidatos.length;i++){
    string = '<div class="form-check"><input class="form-check-input" type="radio" name="r_candidato" id="" value="'+candidatos[i]+'"><label class="form-check-label" for="exampleRadios1">'+candidatos[i]+'</label></div>';
    $('#radio_candidatos').append(string);
  }
  showDiv('.div_votar');
}

async function Votar(){
  let seleccionado = $("#myform input[type='radio']:checked").val();
  const account = await getCurrentAccount();
  const add_candidato = await window.contract.methods.Votar(seleccionado).send({ from: account});
  //showDiv('.div_dashboard');
  console.log(add_candidato);
}

function showDiv(divName){
  $('.div_menu').hide();
  $(divName).show('slow');
}

function exportarTabla()
{
  $("#blockTable").table2excel({
    filename: "votacion_blockchain.xls"
  });
}

load();
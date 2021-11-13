Moralis.initialize("QK0IpIWHydSbkP1QssmyRobI4v6UNU2DaxhKSZcU");
Moralis.serverURL = "https://ssgycxnqyopj.usemoralis.com:2053/server";


  document.getElementById("btn-login").onclick = login;
  document.getElementById("btn-logout").onclick = logOut;

async function login() {
  let user = Moralis.User.current();
  if (!user) {
    user = await Moralis.authenticate();
    $('#user_address').text(user.attributes.ethAddress);
    $('#logout_btn').show('fast');
    $('#login_btn').hide();
  }
  console.log("logged in user:", user);
}

async function logOut() {
  $('#user_address').text('');
  await Moralis.User.logOut();
  $('#login_btn').show('fast');
  $('#logout_btn').hide();
  console.log("logged out");
}

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
      const currentUser = Moralis.User.current();
      if (currentUser) {
        $('#user_address').text(currentUser.attributes.ethAddress);
          $('#logout_btn').show('fast');
          return currentUser.attributes.ethAddress;
      } else {
          // show the signup or login page
          $('#login_btn').show('fast');
          return '';
      }
  }

async function load(){
      //check if logged in

      await getCurrentAccount();

      await loadWeb3();
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
  if(ganador == 'Empate!')
  {
    $('#ganador').text(ganador);
  }
  else
  {
    $('#ganador').text(ganador+' Votos:'+votos_ganador);
  }

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

  //  var donutDataAU = {
//     datasets: [{
//       data: values,
//       lineTension: 0,
//       backgroundColor: 'transparent',
//       borderColor: '#007bff',
//       borderWidth: 4,
//       pointBackgroundColor: '#007bff'
//     }],
//     // These labels appear in the legend and in the tooltips when hovering different arcs
//     labels: labels,
// };
// var ctx = document.getElementById("donut-chart-au").getContext("2d");
// var myDoughnutChart = new Chart(ctx, {
//     type: 'pie',
//     data: donutDataAU,
//     options: {
//           plugins: {
//                 title: {
//                     display: true,
//                     text: 'Votaciones'
//                 }
//           },
//           cornerRadius: 20,
//           responsive: true,
//           maintainAspectRatio: false,
//           title: {
//             display: false,
//           },
//           tooltips: {
//             mode: 'index',
//             intersect: true
//           }
//         }
// });

  //console.log(resultados);
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
  //showDiv('.div_votar');
}

async function Votar(){
  let seleccionado = $("#myform input[type='radio']:checked").val();
  const account = await getCurrentAccount();
  console.log(account);
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
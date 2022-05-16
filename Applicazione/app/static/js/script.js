var utenti = [];
var categorie = [];
var ticket = [];
var apiUrl = "http://localhost:5000/api/"
var currentModal;

function navigate(page) {
    jQuery("#content").load(page, function (response, status, xhr) {
        //console.log(xhr.status + " " + xhr.statusText);
        feather.replace();
    });
}

function openModal(modalID) {
    currentModal = new bootstrap.Modal(document.getElementById(modalID), {});
    currentModal.show();
}

function cleanUserTable() {	
	var table = document.getElementById("tblUtenti");
	while(table.rows.length > 1) {
	  table.deleteRow(1);
	}
}

function cleanTicketTable() {	
	var table = document.getElementById("tblTicketCliente");
	while(table.rows.length > 1) {
	  table.deleteRow(1);
	}
}

function loadTickets() {
	ruolo = sessionStorage.getItem('role');
	//console.log(ruolo);
	
	if(ruolo == 'cliente'){
		$("#ticket_cliente").css("visibility", "visible");
		$("#ticket_cliente").css("display", "block");
	}
	else if(ruolo == 'tecnico'){
		$("#ticket_tecnico").css("visibility", "visible");
		$("#ticket_tecnico").css("display", "block");
	}
	
	$.ajax({
		type: 'GET',
		url: apiUrl+"get_tickets",
		data: {},
		dataType: 'json',
		success: function (data){
			ticket = data;
			
			if(ruolo == 'cliente'){
				ticket['ticket_cliente'].forEach(t => {

					var stato;
					
					if (t['stato'] == 'aperto'){
						stato = '<td style="text-align: center; width: 1%;"><span style="color:#ff0000" data-feather="sun" title="Aperto"></span></td>';
					}
					else if(t['stato'] == 'chiuso'){
						stato = '<td style="text-align: center; width: 1%;"><span style="color:#00ff00" data-feather="check-square" title="Chiuso"></span></td>';
					}
					else {
						stato = '<td style="text-align: center; width: 1%;"><span style="color:#ff8000" data-feather="refresh-ccw" title="In lavorazione"></span></td>';
					}
					
					document.getElementById('tblTicketCliente').insertRow(-1).innerHTML = '<td style="text-align: center">'+t['timestamp_insert']+'</td>' +
						'<td style="text-align: center">'+t['nome']+'</td> ' + 
						'<td style="text-align: center"><a href="javascript:mostraTicket('+t['tid']+')">'+t['titolo']+'</a></td> ' +
						stato;
				});
			}
			else if(ruolo == 'tecnico'){
				ticket['ticket_cliente'].forEach(t => {
					document.getElementById('tblTicketAperti').insertRow(-1).innerHTML = '<td style="text-align: center">'+t['timestamp_insert']+'</td>' +
						'<td style="text-align: center">'+t['nome']+'</td> ' +
						'<td style="text-align: center">'+t['nome_utente']+' '+t['cognome_utente']+'</td> ' + 
						'<td style="text-align: center"><a href="javascript:mostraTicket('+t['tid']+')">'+t['titolo']+'</a></td> ';
				});
				
				ticket['ticket_tecnico'].forEach(t => {
					if(t['stato'] == 'chiuso'){
						document.getElementById('tblTicketRisolti').insertRow(-1).innerHTML = '<td style="text-align: center">'+t['timestamp_insert']+'</td>' +
						'<td style="text-align: center">'+t['nome']+'</td> ' +
						'<td style="text-align: center">'+t['nome_utente']+' '+t['cognome_utente']+'</td> ' + 
						'<td style="text-align: center"><a href="javascript:mostraTicket('+t['tid']+')">'+t['titolo']+'</a></td> ';
					}
					else{
						document.getElementById('tblTicketInCarico').insertRow(-1).innerHTML = '<td style="text-align: center">'+t['timestamp_insert']+'</td>' +
						'<td style="text-align: center">'+t['nome']+'</td> ' +
						'<td style="text-align: center">'+t['nome_utente']+' '+t['cognome_utente']+'</td> ' + 
						'<td style="text-align: center"><a href="javascript:mostraTicket('+t['tid']+')">'+t['titolo']+'</a></td> ';
					}
				});
			}
			
			feather.replace();
		}
	});
}

function loadCat() {
	$.ajax({
		type: 'GET',
		url: apiUrl+"get_cat_list",
		data: {},
		dataType: 'json',
		success: function (data){
			data.forEach(opt => {
				var newOption = new Option(opt['nome'], opt['cid'], false, false);
				$('#categoria').append(newOption);
			});
		}
	});
}

function loadUsers() {
	$.ajax({
		type: 'GET',
		url: apiUrl+"get_users_list",
		data: {},
		dataType: 'json',
		success: function (data){
			utenti = data;
			utenti.forEach(u => {
				document.getElementById('tblUtenti').insertRow(-1).innerHTML = '<td style="text-align: center">'+u['ruolo']+'</td>' +
					'<td style="text-align: center">'+u['nome']+'</td> ' +
					'<td style="text-align: center">'+u['cognome']+'</td> ' +
					'<td style="text-align: center; width: 1%;"><a href="javascript:editUser('+u['uid']+')" style="color:#000;" title="Modifica"><span data-feather="edit"></span></a> </td> ' +
					'<td style="text-align: center; width: 1%;"> <a href="javascript:deleteUser('+u['uid']+')" style="color:#000;" title="Elimina"><span data-feather="user-x"></span></a> </td>';
			});
			feather.replace();
			$('#tblUtenti').removeClass("table-striped").addClass("table-striped");
		}
	});
}

function loadCats() {
	$.ajax({
		type: 'GET',
		url: apiUrl+"get_cat_list",
		data: {},
		dataType: 'json',
		success: function (data){
			categorie = data;
			categorie.forEach(c => {
				document.getElementById('tblCat').insertRow(-1).innerHTML = '<td style="text-align: center">'+c['nome']+'</td> ' +
					'<td style="text-align: center">'+c['descrizione']+'</td> ' +
					'<td style="text-align: center; width: 1%;"><a href="javascript:editCat('+c['cid']+')" style="color:#000;" title="Modifica"><span data-feather="edit"></span></a> </td> ' +
					'<td style="text-align: center; width: 1%;"> <a href="javascript:deleteCat('+c['cid']+')" style="color:#000;" title="Elimina"><span data-feather="trash"></span></a> </td>';
			});
			feather.replace();
			$('#tblUtenti').removeClass("table-striped").addClass("table-striped");
		}
	});
}

function addCat() {
    $('#modalTitle').html("Aggiungi categoria");
    $('#nome').val("");
    $('#descrizione').val("");
    $('#catid').val("");
    openModal('catModal');
}

function editCat(cid) {
    const index = categorie.findIndex(object => {
        return object.cid === cid;
    });

    $('#modalTitle').html("Modifica categorie");
    $('#nome').val(categorie[index]['nome']);
    $('#descrizione').val(categorie[index]['descrizione']);
    $('#catid').val(cid);
    openModal('catModal');
}

function deleteCat(cid){
	if (confirm('Eliminare questa categoria?')){
		//TODO
	}
}

function processCatForm(){
	//TODO
}

function addUser() {
    $('#modalTitle').html("Aggiungi utente");
    $('#email').val("");
    $('#password').val("");
    $('#nome').val("");
    $('#cognome').val("");
    $('#userid').val("");
	$("#ruolo").val("").change();
    openModal('userModal');
}

function deleteUser(uid) {
    if (confirm("Sei sicuro di voler eliminare questo utente?")) {
		
		frm = new FormData();
		frm.append('uid', uid);
		
		
		$.ajax({
			type: 'POST',
			url: apiUrl+"delete_user",
			data: frm,
			dataType: 'json',
			processData: false,
			contentType: false,
			success: function (data){
				//Questo non è ottimizzato, si dovrebbe eliminare solo il record dall'elenco già sul client
				cleanUserTable();
				loadUsers();
			}
		});
    }
}

function editUser(uid) {
    const index = utenti.findIndex(object => {
        return object.uid === uid;
    });

    $('#modalTitle').html("Modifica utente");
    $('#email').val(utenti[index]['email']);
    $('#password').val("");
    $('#nome').val(utenti[index]['nome']);
    $('#cognome').val(utenti[index]['cognome']);
    $('#userid').val(uid);
	$("#ruolo").val(utenti[index]['ruolo']).change();
    openModal('userModal');
}

function addTicket() {
    $('#categoria').val("");
    $('#titolo').val("");
    $('#testo').val("");
    openModal('ticketModal');
}

function cleanTicket(){
	$("#descr").html("");
	$("#risposte").html("");
	$("#carico").css("visibility", "hidden");
	$("#carico").css("display", "none");
	$("#nuovo_messaggio").css("visibility", "visible");
	$("#nuovo_messaggio").css("display", "block");
}

function assegnaTicket(){
	if (confirm('Prendere in carico il ticket?')){
		frm = new FormData();
		tid = $("#tid").val()
		frm.append('tid', tid);
		$.ajax({
			type: 'POST',
			url: apiUrl+"assign_ticket",
			data: frm,
			dataType: 'json',
			processData: false,
			contentType: false,
			success: function (data){
				
				if(data['ok']){
					//Non è la procedura migliore, bisognerebbe aggiornare solo l'interfaccia
					cleanTicket();
					mostraTicket(tid);
				}
				else{
					alert('Impossibile assegnare il ticket');
				}
			}
		});
	}
}

function mostraTicket(tid) {
	ruolo = sessionStorage.getItem('role');
	
	if(ruolo == 'cliente'){
		$("#ticket_cliente").css("visibility", "hidden");
		$("#ticket_cliente").css("display", "none");
	}
	else if(ruolo == 'tecnico'){
		$("#ticket_tecnico").css("visibility", "hidden");
		$("#ticket_tecnico").css("display", "none");
	}
	
	$("#mostra_ticket").css("visibility", "visible");
	$("#mostra_ticket").css("display", "block");
	
	
	frm = new FormData();
	frm.append('tid', tid);
	
	
	$.ajax({
		type: 'POST',
		url: apiUrl+"get_ticket",
		data: frm,
		dataType: 'json',
		processData: false,
		contentType: false,
		success: function (data){
			$("#tid").val(data['ticket_data']['tid']);
			
			$("#descr").append("<h2>"+data['ticket_data']['titolo']+"</h2><br />");
			$("#descr").append("<b>Creato il</b> "+data['ticket_data']['timestamp_insert']+"<br />");
			$("#descr").append("<b>Stato</b> "+data['ticket_data']['stato']+"<br />");
			$("#descr").append("<b>Categoria</b> "+data['ticket_data']['nome']+"<br />");
			
			if(data['ticket_data']['stato'] != 'aperto'){
				$("#descr").append("<b>Tecnico</b> "+data['ticket_data']['nome_tecnico']+" "+data['ticket_data']['cognome_tecnico']+"<br />");
				$("#descr").append("<b>Preso in carico il</b> "+data['ticket_data']['timestamp_carico']+"<br />");
			}
			
			if(data['ticket_data']['stato'] == 'chiuso'){
				$("#descr").append("<b>Chiuso il</b> "+data['ticket_data']['timestamp_chiusura']+"<br />");
				
				$("#nuovo_messaggio").css("visibility", "hidden");
				$("#nuovo_messaggio").css("display", "none");
			}
			
			if(data['ticket_data']['stato'] == 'aperto' && ruolo == 'tecnico'){
				$("#nuovo_messaggio").css("visibility", "hidden");
				$("#nuovo_messaggio").css("display", "none");
				$("#carico").css("visibility", "visible");
				$("#carico").css("display", "block");
			}
			
			if(data['ticket_data']['stato'] == 'in_carico' && ruolo == 'tecnico'){
				$("#chiuditicket").css("visibility", "visible");
				$("#chiuditicket").css("display", "block");
			}
			
			
			$("#risposte").append("<div class='row'><div class='col'><div class='card'><div class='card-body'>" +
								  "<b>"+data['ticket_data']['nome_autore']+" "+data['ticket_data']['cognome_autore']+"</b> il <b>"+data['ticket_data']['timestamp_insert']+"</b> ha creato il ticket: <br />"+data['ticket_data']['messaggio'] +
								  "</div></div></div></div><br />");
			
			data['risposte'].forEach(r => {
				$("#risposte").append("<div class='row'><div class='col'><div class='card'><div class='card-body'>" +
									  "<b>"+r['nome']+" "+r['cognome']+"</b> il <b>"+r['timestamp_ins']+"</b> ha scritto: <br />"+r['messaggio'] +
									  "</div></div></div></div><br />");	
			});
			
			if(data['ticket_data']['stato'] == 'chiuso'){
				$("#risposte").append("<div class='row'><div class='col'><div class='card'><div class='card-body'>" +
								  "<b>"+data['ticket_data']['nome_tecnico']+" "+data['ticket_data']['cognome_tecnico']+"</b> il <b>"+data['ticket_data']['timestamp_chiusura']+"</b> ha chiuso il ticket: <br />"+data['ticket_data']['report_chiusura'] +
								  "</div></div></div></div><br />");
			}
		}
	});
}

function addMessage() {
	var messaggio = $.trim($('#risposta').val());
	var chiudi = $('#chiudi').prop('checked');
	tid = $("#tid").val()
	
	if (messaggio.length == 0){
		alert("Devi inserire un messaggio");
	}
	else {
		frm = new FormData();
		frm.append('tid', tid);
		frm.append('messaggio', messaggio);
		frm.append('chiudi', chiudi);
		
		var continua = true;
		if (chiudi){
			continua = confirm('Chiudere il ticket?')
		}
		
		if (continua){
			$.ajax({
				type: 'POST',
				url: apiUrl+"add_message",
				data: frm,
				dataType: 'json',
				processData: false,
				contentType: false,
				success: function (data){
					if ('error' in data){
						alert('Impossibile inserire il messaggio.');
					}
					else {
						cleanTicket();
						mostraTicket(tid);
					}
				}
			});
		}
		
		
		$('#risposta').val("");
	}
}

function processTicketForm() {
    var categoria = $('#categoria').val();
    var titolo = $('#titolo').val();
    var testo = $('#testo').val();
	
	frm = new FormData();
    frm.append('categoria', categoria);
	frm.append('titolo', titolo);
	frm.append('testo', testo);
	
	
	$.ajax({
		type: 'POST',
		url: apiUrl+"add_ticket",
		data: frm,
		dataType: 'json',
		processData: false,
		contentType: false,
		success: function (data){
			if ('error' in data){
				alert('Impossibile creare il ticket. Controllare di aver inserito tutti i dati.');
			}
			else if (data['tid'] > 0){
				//Questo non è ottimizzato, si dovrebbe inserire solo il record nuovo
				currentModal.hide();
				cleanTicketTable();
				loadTickets();
				console.log('ticket inserito');
			}
			else {
				alert("Errore generico")
			}
		}
	});

}

function processUserForm() {
    var email = $('#email').val();
    var pass = $('#password').val();
    var nome = $('#nome').val();
    var cognome = $('#cognome').val();
    var uid = $('#userid').val();
	var ruolo = $("#ruolo").val();

	/*
    if (uid != "") {
        console.log("Edit user");
    } else {
        console.log("New user");
    }
	*/
	
	frm = new FormData();
    frm.append('email', email);
	frm.append('password', pass);
	frm.append('nome', nome);
	frm.append('cognome', cognome);
	frm.append('uid', uid);
	frm.append('ruolo', ruolo);
	
	
	$.ajax({
		type: 'POST',
		url: apiUrl+"add_edit_user",
		data: frm,
		dataType: 'json',
		processData: false,
		contentType: false,
		success: function (data){
			if ('error' in data){
				alert('Impossibile inserire/editare l\'utente. Controllare di aver inserito tutti i dati.');
			}
			else if (uid != "" && 'edit' in data && data['edit'] == 1){
				currentModal.hide();
				//Questo non è ottimizzato, si dovrebbe inserire solo il record nuovo
				cleanUserTable();
				loadUsers();
			}
			else if (uid == "" && data['uid'] > 0){
				//Questo non è ottimizzato, si dovrebbe inserire solo il record nuovo
				currentModal.hide();
				cleanUserTable();
				loadUsers();
			}
			else {
				alert("Errore generico. Forse l\'email esiste già nel sistema?")
			}
		}
	});

}

function login() {
    var email = $('#email').val();
    var pass = $('#password').val();
	
	frm = new FormData();
    frm.append('email', email);
	frm.append('password', pass);
	
	
	$.ajax({
		type: 'POST',
		url: apiUrl+"login",
		data: frm,
		dataType: 'json',
		processData: false,
		contentType: false,
		success: function (data){
			if (!data['auth']){
				alert('Username/password non validi');
			}
			else {
				sessionStorage.setItem('logged', true);
				sessionStorage.setItem('uid', data['uid']);
				sessionStorage.setItem('role', data['role']);
				sessionStorage.setItem('nome', data['nome']);
				sessionStorage.setItem('cognome', data['cognome']);
				
				if(data['role'] =='amministratore'){
					$("#nav_utenti").css("visibility", "visible");
					$("#nav_ticket").css("visibility", "hidden");
					$("#nav_categorie").css("visibility", "visible");
					navigate('static/pages/utenti.html');
				}
				else{
					$("#nav_ticket").css("visibility", "visible");
					navigate('static/pages/ticket.html');
				}
				
				$("#logged").css("visibility", "visible");
				$("#login").css("visibility", "hidden");
				
			}
		}
	});
}

function logout(){
	$.ajax({
		type: 'POST',
		url: apiUrl+"logout",
		dataType: 'json',
		processData: false,
		contentType: false,
		success: function (data){
			if (!data['auth']){				
				$("#content").html("");
				
				$("#logged").css("visibility", "hidden");
				$("#login").css("visibility", "visible");
				$("#nav_utenti").css("visibility", "hidden");
				$("#nav_ticket").css("visibility", "hidden");
				$("#nav_categorie").css("visibility", "hidden");
				
				
				sessionStorage.setItem('logged', false);
				sessionStorage.setItem('uid', -1);
				sessionStorage.setItem('role', "");
				sessionStorage.setItem('nome', "");
				sessionStorage.setItem('cognome', "");
			}
			else {
				alert("Impossibile eseguire logout");
			}
		}
	});
}
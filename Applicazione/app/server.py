from flask import Flask
from flask_cors import CORS, cross_origin
from flask_session import Session
from flask import request, redirect, render_template, abort, session, send_from_directory
import json
import sqlalchemy
import hashlib
import decimal
from functools import wraps
import datetime

#Flask application
#Developed by Luca Gagliardelli (luca.gagliardelli@unimore.it)
webApp = Flask(__name__)
webApp.config['TEMPLATES_AUTO_RELOAD'] = True
webApp.config['ENV'] = ""
webApp.config['SESSION_TYPE'] = "filesystem"
webApp.secret_key = b'can_5#y2L"F4Q8z\n\xec]/'
Session(webApp)
CORS(webApp)


##Parametri di connessione al database (PostgreSQL)
dbuser = ""
dbpass = ""
dbname = "ticket"
dbhost = "127.0.0.1:5432"

engine = sqlalchemy.create_engine("postgresql://"+dbuser+":"+dbpass+"@"+dbhost+"/"+dbname)

##
##------------------------------------------------- METODI PER USO INTERNO ---------------------------------------------
##

def start_server():
    """
    Avvia il server
    """
    webApp.run(host='0.0.0.0', port='5000')
    
def write_log(msg):
    """
    Scrive un log
    """
    print(msg)
    pass
    
class DecimalEncoder(json.JSONEncoder):
    """
    Converte i numeri decimali e le date quando si trasforma un json in stringa
    """
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return str(obj)
        elif isinstance(obj, datetime.datetime):
            return str(obj)
        return super(DecimalEncoder, self).default(obj)

def runQuery(query):
    """
    Esegue una query e ritorna il risultato come un array di dict
    """
    global engine
    global worker
    results = []
    try:
        write_log("Eseguo query "+query)
        conn = engine.connect()
        txtQuery = sqlalchemy.text(query)
        result = conn.execute(txtQuery)
        write_log("Query eseguita")
        
        columns = result.keys()
        
        for row in result:
            results.append(dict(zip(columns, row)))
    except Exception as e:
        write_log("Impossibile eseguire la query")
        write_log(e)
    return results

def runEditQuery(query):
    """
    Esegue una query che agisce sul db e non ritorna nulla
    """
    global engine
    results = []
    try:
        write_log("Eseguo query "+query)
        conn = engine.connect()
        result = conn.execute(sqlalchemy.text(query))
        write_log("Query eseguita")
        
    except Exception as e:
        write_log("Impossibile eseguire la query")
        write_log(e)
    pass
    
    
def authenticated(user_role=""):
    """
    Verifica che un utente abbia fatto il login con il ruolo richiesto
    """
    def actual_decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            auth = False
            try:
                write_log("verifico che l'utente sia autenticato con ruolo di "+user_role)
                if ('authenticated' in session) and session['authenticated']:
                    if user_role == "" or session['role'] == user_role:
                        auth = True
            except Exception:
                pass
            
            if not auth:
                write_log("Autenticazione fallita")
                abort(401)
            return f(*args, **kwargs)
        return wrapper
    return actual_decorator

@webApp.route('/', methods=['GET'])
@cross_origin(supports_credentials=True)
def default():
    """
    Serve la pagina di default
    """
    return send_from_directory('static', 'index.html')
    
    
##
##------------------------------------------------- METODI PER GESTIONE UTENTI ---------------------------------------------
##

@webApp.route('/api/get_users_list', methods=['GET'])
@cross_origin(supports_credentials=True)
@authenticated(user_role="amministratore")
def get_users_list():
    """
    Ritorna tutti i dati della tabella utente
    """
    res = dict()
    try:
        res = runQuery("SELECT * FROM utente")
    except Exception as e:
        write_log("Impossibile leggere utenti")
        write_log(e)
        
    return json.dumps(res, cls=DecimalEncoder)

@webApp.route('/api/delete_user', methods=['POST'])
@cross_origin(supports_credentials=True)
@authenticated(user_role="amministratore")
def delete_user():
    """
    Elimina un utente dato il suo uid
    """
    res = dict()
    try:
        uid = str(request.form.get('uid')).strip()
        
        if len(uid) > 0:
            runEditQuery(f"DELETE FROM utente WHERE uid = '{uid}'")
        
    except Exception as e:
        write_log("Impossibile eliminare l'utente")
        write_log(e)
        
    return json.dumps(res, cls=DecimalEncoder)


@webApp.route('/api/add_edit_user', methods=['POST'])
@cross_origin(supports_credentials=True)
@authenticated(user_role="amministratore")
def add_edit_user():
    """
    Inserisce un nuovo utente se uid non è settato.
    Altrimenti modifica i dati di un utente esistente
    """
    res = dict()
    try:
        email = str(request.form.get('email')).strip()
        password = str(request.form.get('password')).strip()
        nome = str(request.form.get('nome')).strip()
        cognome = str(request.form.get('cognome')).strip()
        uid = str(request.form.get('uid')).strip()
        ruolo = str(request.form.get('ruolo')).strip()
        
        #Campi obbligatori
        if len(email) == 0 or len(nome) == 0 or len(cognome) == 0 or len(ruolo) == 0:
            res['error'] = 1
        #Password obbligatoria se nuovo utente
        elif len(uid) == 0 and len(password) == 0:
            res['error'] = 1
            
        else:        
            #Nuovo utente
            if len(uid) == 0:
            
                #Inserisco l'utente e recupero lo uid che gli ha dato il sistema
                query = f"INSERT INTO utente(email, password, nome, cognome, ruolo) VALUES ('{email}', MD5('{password}'), '{nome}', '{cognome}', '{ruolo}') RETURNING uid"
                data = runQuery(query)
                
                if len(data) > 0:
                    res = data[0]
                else:
                    res['uid'] = -1
            else:
                query = f"UPDATE utente SET email = '{email}', nome = '{nome}', cognome = '{cognome}', ruolo = '{ruolo}'"
                if len(password) > 0:
                    query+= f" password = 'MD5({password}')"
                query += f" WHERE uid = '{uid}'"
                runEditQuery(query)
                res['edit'] = 1
                
        
    except Exception as e:
        write_log("Impossibile inserire/modificare utente")
        write_log(e)
        
    return json.dumps(res, cls=DecimalEncoder)

@webApp.route('/api/login', methods=['POST'])
@cross_origin(supports_credentials=True)
def login():
    """
    Esegue il login di un utente
    """
    res = dict()
    res["auth"] = False
    try:
        email = str(request.form.get("email"))
        password = str(request.form.get("password"))
        
        data = runQuery(f"SELECT uid, nome, cognome, ruolo FROM utente WHERE email = '{email}' AND password = MD5('{password}')")
        
        if len(data) > 0:
            session['authenticated'] = True
            session['role'] = data[0]['ruolo']
            session['uid'] = data[0]['uid']
            res["auth"] = True
            res['role'] = data[0]['ruolo']
            res['uid'] = data[0]['uid']
            res['nome'] = data[0]['nome']
            res['cognome'] = data[0]['cognome']
        
    except Exception as e:
        write_log("Impossibile autenticare")
        write_log(e)
        
    return json.dumps(res, cls=DecimalEncoder)
    
@webApp.route('/api/logout', methods=['POST'])
@cross_origin(supports_credentials=True)
@authenticated()
def logout():
    """
    Esegue il logout di un utente
    """
    res = dict()
    res["auth"] = True
    try:
        print(session)
        session.clear()
        res["auth"] = False
        
    except Exception as e:
        write_log("Impossibile fare logout")
        write_log(e)
        
    return json.dumps(res, cls=DecimalEncoder)
    
##
##------------------------------------------------- METODI PER GESTIONE TICKET ---------------------------------------------
##

@webApp.route('/api/get_tickets', methods=['GET'])
@cross_origin(supports_credentials=True)
@authenticated(user_role="")
def get_tickets():
    """
    Ritorna l'elenco dei ticket
    """
    res = dict()
    try:
        if session['role'] == 'cliente':
            res['ticket_cliente'] = runQuery(f"SELECT t.*, c.nome FROM ticket t JOIN categoria c ON t.cid = c.cid WHERE t.uid_cliente = '{session['uid']}' ORDER BY t.timestamp_insert DESC")
        elif session['role'] == 'tecnico':
            res['ticket_cliente'] = runQuery("SELECT t.*, c.nome, u.nome AS nome_utente, u.cognome AS cognome_utente FROM ticket t JOIN categoria c ON t.cid = c.cid JOIN utente u on u.uid = t.uid_cliente WHERE t.stato = 'aperto' ORDER BY t.timestamp_insert DESC")
            res['ticket_tecnico'] = runQuery(f"SELECT t.*, c.nome, u.nome AS nome_utente, u.cognome AS cognome_utente FROM ticket t JOIN categoria c ON t.cid = c.cid JOIN utente u on u.uid = t.uid_cliente WHERE t.uid_tecnico = '{session['uid']}' ORDER BY t.timestamp_insert DESC")
    except Exception as e:
        write_log("Impossibile leggere utenti")
        write_log(e)
        
    return json.dumps(res, cls=DecimalEncoder)
    
@webApp.route('/api/add_message', methods=['POST'])
@cross_origin(supports_credentials=True)
@authenticated(user_role="")
def add_message():
    """
    Inserisce un nuovo messaggio in un ticket, può anche chiudere un ticket
    """
    res = dict()
    try:
        tid = int(request.form.get('tid'))
        chiudi = str(request.form.get('chiudi')).strip()
        messaggio = str(request.form.get('messaggio')).strip()
        
        if session['role'] == 'tecnico' and chiudi == "true":
            query = f"UPDATE ticket SET stato = 'chiuso', timestamp_chiusura = NOW(), report_chiusura = '{messaggio}' WHERE tid = {tid}"
        else:
            query = f"INSERT INTO risposta(tid, timestamp_ins, messaggio, uid) VALUES({tid}, NOW(), '{messaggio}', {session['uid']})"
        runEditQuery(query);
        res['ok'] = True;
    except Exception as e:
        res['error'] = True;
        write_log("Impossibile leggere il ticket")
        write_log(e)
        
    return json.dumps(res, cls=DecimalEncoder)

@webApp.route('/api/assign_ticket', methods=['POST'])
@cross_origin(supports_credentials=True)
@authenticated(user_role="tecnico")
def assign_ticket():
    """
    Assegna un ticket ad un tecnico
    """
    res = dict()
    res['ok'] = False;
    try:
        tid = int(request.form.get('tid'))
        query = f"UPDATE ticket SET uid_tecnico = '{session['uid']}', timestamp_carico = NOW(), stato = 'in_carico' WHERE tid = {tid}"
        runEditQuery(query);
        res['ok'] = True;
    except Exception as e:
        write_log("Impossibile leggere il ticket")
        write_log(e)
        
    return json.dumps(res, cls=DecimalEncoder)

@webApp.route('/api/get_ticket', methods=['POST'])
@cross_origin(supports_credentials=True)
@authenticated(user_role="")
def get_ticket():
    """
    Recupera tutti i dati di un ticket fornito il suo id
    """
    res = dict()
    try:
        tid = int(request.form.get('tid'))
        query = f"SELECT t.*, c.nome, u.nome AS nome_autore, u.cognome AS cognome_autore, u1.nome AS nome_tecnico, u1.cognome AS cognome_tecnico FROM ticket t JOIN categoria c ON c.cid = t.cid LEFT JOIN utente u ON u.uid = t.uid_cliente LEFT JOIN utente u1 ON u1.uid = t.uid_tecnico WHERE t.tid = {tid}"
        res['ticket_data'] = runQuery(query)[0]
        res['risposte'] = runQuery(f"SELECT r.*, u.nome, u.cognome FROM risposta r JOIN utente u ON u.uid = r.uid WHERE r.tid = {tid} ORDER BY timestamp_ins")
        
    except Exception as e:
        write_log("Impossibile leggere il ticket")
        write_log(e)
        
    return json.dumps(res, cls=DecimalEncoder)
    
@webApp.route('/api/add_ticket', methods=['POST'])
@cross_origin(supports_credentials=True)
@authenticated(user_role="cliente")
def add_ticket():
    """
    Inserisce nuovo ticket
    """
    res = dict()
    try:
        cid = int(request.form.get('categoria'))
        titolo = str(request.form.get('titolo')).strip()
        testo = str(request.form.get('testo')).strip()
        
        #Campi obbligatori
        if len(titolo) == 0 or len(testo) == 0 or cid == 0:
            res['error'] = 1
        else:        
            #Inserisco il ticket
            query = f"INSERT INTO ticket(titolo, messaggio, timestamp_insert, cid, uid_cliente, stato) VALUES ('{titolo}', '{testo}', NOW(), {cid}, {session['uid']}, 'aperto') RETURNING tid"
            #Leggo l'id che gli ha assegnato il sistema
            res['tid'] = runQuery(query)[0]['tid']
        
    except Exception as e:
        write_log("Impossibile inserire nuovo ticket")
        write_log(e)
        
    return json.dumps(res, cls=DecimalEncoder)
    
##
##------------------------------------------------- METODI PER GESTIONE CATEGORIE ---------------------------------------------
##
    
@webApp.route('/api/get_cat_list', methods=['GET'])
@cross_origin(supports_credentials=True)
@authenticated(user_role="")
def get_cat_list():
    """
    Ritorna l'elenco delle categorie
    """
    res = dict()
    try:
        res = runQuery("SELECT * FROM categoria ORDER BY nome")
    except Exception as e:
        write_log("Impossibile leggere categorie")
        write_log(e)
        
    return json.dumps(res, cls=DecimalEncoder)
    
#Main
if __name__ == '__main__':
	start_server()
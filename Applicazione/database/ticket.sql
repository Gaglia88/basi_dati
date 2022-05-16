CREATE TABLE utente(
	uid SERIAL PRIMARY KEY,
	email VARCHAR(255) NOT NULL UNIQUE,
	password VARCHAR(255) NOT NULL,
	nome VARCHAR(255) NOT NULL, 
	cognome VARCHAR(255) NOT NULL,
	ruolo VARCHAR(255) NOT NULL CHECK(ruolo IN ('amministratore', 'cliente', 'tecnico'))
);

INSERT INTO utente (uid, email, password, nome, cognome, ruolo) VALUES
(1, 'admin', md5('admin'), 'Mario', 'Rossi', 'amministratore'),
(2, 'cliente', md5('cliente'), 'Antonio', 'Ferrari', 'cliente'),
(3, 'tecnico', md5('tecnico'), 'Anna', 'Bianchi', 'tecnico');


CREATE TABLE categoria(
	cid SERIAL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL UNIQUE,
	descrizione VARCHAR(255) NOT NULL
);

INSERT INTO categoria(cid, nome, descrizione) VALUES
(1, 'Guasti', 'Segnalazione guasti del sistema'),
(2, 'Informazioni', 'Richiesta informazioni'),
(3, 'Amministrazione', 'Richieste amministrative');

CREATE TABLE ticket(
	tid SERIAL PRIMARY KEY,
	titolo VARCHAR(255) NOT NULL,
	messaggio TEXT NOT NULL,
	timestamp_insert TIMESTAMP NOT NULL,
	timestamp_carico TIMESTAMP NULL,
	report_chiusura TEXT NULL,
	timestamp_chiusura TIMESTAMP NULL,
	uid_cliente INT NOT NULL REFERENCES utente(uid) ON DELETE CASCADE ON UPDATE CASCADE,
	uid_tecnico INT NULL,
	stato VARCHAR(255) NOT NULL CHECK(stato IN ('aperto', 'in_carico', 'chiuso')) DEFAULT 'aperto',
	cid INT NOT NULL REFERENCES categoria(cid)
);

CREATE TABLE risposta(
	rid SERIAL PRIMARY KEY,
	tid INT NOT NULL REFERENCES ticket(tid) ON DELETE CASCADE ON UPDATE CASCADE,
	timestamp_ins TIMESTAMP NOT NULL,
	messaggio TEXT NOT NULL,
	uid INT NOT NULL REFERENCES utente(uid) ON DELETE CASCADE ON UPDATE CASCADE
);
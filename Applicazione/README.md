# Gestione ticket
Questo progetto è stato realizzato per l'insegnamento "Basi di dati" della Laurea Triennale in Ingegneria Informatica - sede di Mantova dell'Università di Modena e Reggio Emilia.
Propone un esempio di utilizzo di un database per la gestione di ticket di un portale fittizio.
### Istruzioni
1. Installare Python (versione almeno 3.6). Si consiglia l'uso di [Anaconda](https://www.anaconda.com/products/distribution).
2. Scaricare tutto il contenuto di questa cartella (es. con `git clone`).
3. Aprire il terminale di Python e spostarsi nella cartella dove avete scaricato tutti i file.
4. Utilizzare il comando `pip install -r requirements.txt` per installare tutte le librerie richieste al funzionamento dell'applicazione.
5. Aprire pgAdmin, creare un nuovo database con il nome che si preferisce, ed eventualmente creare un nuovo utente che può accedere a questo database.
6. Creare le tabelle utilizzando il file `database/ticket.sql`
7. Aprire il file `app/server_nosol.py` e inserire le credenziali per collegarsi al database creato al punto precedente.
8. Per eseguire l'applicazione spostarsi nella cartella `app` ed eseguire il comando `python server_nosol.py`.
9. Aprire il browser e collegarsi all'indirizzo visualizzato dalla shell.

### Esercizio
All'interno del file `app/server_nosol.py` devono essere scritte diverse query affinché il sistema funzioni. I punti in cui inserire le query possono essere individuati cercando la stringa `#!`.

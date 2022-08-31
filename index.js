const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
var executeQuery = require("./sqlConn");
var emoji = require('node-emoji').emoji;
var moment = require("moment");
const user_allowed = [process.env.userAllowed];
var trovato = null;
const token = process.env.TOKEN;
port = process.env.PORT || 443;
host = '0.0.0.0'
externalUrl = process.env.CUSTOM_URL || 'https://app-botsergio.herokuapp.com/',
bot = new TelegramBot(process.env.TOKEN, { webHook: { port : port, host : host } });
bot.setWebHook(externalUrl + ':443/bot' + token);
module.exports = bot;
const { check_if_allowed,
  who_is,
  getDipendente,
  getResp,
  aggiornaData,
  aggiornaDataPassata,
  getData } = require('./function');


/* Helper ingresso */
bot.onText(/^\/ingresso$/, async (msg, match) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Per fissare l'ingresso passare la stringa /ingresso <nome dipendente: sergio>"
  );
});


/* Gestione INGRESSO + NOME */
bot.onText(/\/ingresso (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  let resp = getResp(match[1], msg.from.username);

  if (!check_if_allowed(msg.from.username, chatId, user_allowed)) {
    bot.sendMessage(
      chatId,
      "Utente non autorizzato, il tuo user è:" + username
    );
    return;
  }
  let dipendente = "";
  dipendente = getDipendente(resp);
  if (!dipendente) {
    bot.sendMessage(
      chatId,
      "Non hai inviato nessun nome presente nella lista dipendenti"
    );
    return;
  }
  executeQuery(
    `insert into entrate (nome, giornata, entrata) values ("${dipendente}", "${moment().format("DD-MM-YYYY")}", "${moment().format("HH:mm:ss")}")`,
    function (error, result) {
      if (error) {
        bot.sendMessage(chatId, "Si è verificato un errore durante l'inserimento dell'entrata " + error);
        console.log(error);
      } else {
        bot.sendMessage(chatId, "Ciao " + resp + " entrata inserita " + emoji.white_check_mark);
      }
    }
  );
});



/* Helper uscita */
bot.onText(/^\/uscita$/, async (msg, match) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Per fissare l'uscita passare la stringa /uscita <nome dipendente: sergio>"
  );
});


/* Gestione USCITA + NOME */
bot.onText(/\/uscita (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  let resp = match[1];
  resp = resp.toLowerCase();
  if (!check_if_allowed(msg.from.username, chatId, user_allowed)) {
    bot.sendMessage(
      chatId,
      "Utente non autorizzato, il tuo user è:" + username
    );
    return;
  }
  let dipendente = "";
  dipendente = getDipendente(resp);
  if (!dipendente) {
    bot.sendMessage(
      chatId,
      "Non hai inviato nessun nome presente nella lista dipendenti"
    );
    return;
  }
  trovato = await getData(dipendente, chatId);
  if (!trovato) {
    console.log('Non trovata la data');
    bot.sendMessage(chatId, "Non hai inserito nessuna entrata oggi");
    return;
  }
  aggiornaData(dipendente, chatId, resp);
});




/* Gestione ENTRA */
bot.onText(/\/entra/, (msg, match) => {
  const chatId = msg.chat.id;
  if (!check_if_allowed(msg.from.username, chatId, user_allowed)) {
    bot.sendMessage(
      chatId,
      "Utente non autorizzato, il tuo user è:" + username
    );
    return;
  }
  resp = who_is(msg.from.username);
  if (!resp) {
    return;
  }
  let dipendente = "";
  dipendente = getDipendente(resp);
  if (!dipendente) {
    bot.sendMessage(
      chatId,
      "Non hai inviato nessun nome presente nella lista dipendenti"
    );
    return;
  }

  executeQuery(
    `insert into entrate (nome, giornata, entrata) values ("${dipendente}", "${moment().format("DD-MM-YYYY")}", "${moment().format("HH:mm:ss")}")`,
    function (error, result) {
      if (error) {
        bot.sendMessage(chatId, "Si è verificato un errore durante l'inserimento dell'entrata " + error);
        console.log(error);
      } else {
        bot.sendMessage(chatId, "Ciao " + resp + " entrata inserita " + emoji.white_check_mark);
      }
    }
  );
});



/* Gestione ESCI */
bot.onText(/\/esci/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!check_if_allowed(msg.from.username, chatId, user_allowed)) {
    bot.sendMessage(
      chatId,
      "Utente non autorizzato, il tuo user è:" + username
    );
    return;
  }
  resp = who_is(msg.from.username);
  if (!resp) {
    return;
  }
  let dipendente = "";
  dipendente = getDipendente(resp);
  if (!dipendente) {
    bot.sendMessage(
      chatId,
      "Non hai inviato nessun nome presente nella lista dipendenti"
    );
    return;
  }
  trovato = await getData(dipendente, chatId);
  if (!trovato) {
    console.log('Non trovata la data');
    bot.sendMessage(chatId, "Non hai inserito nessuna entrata oggi");
    return;
  }
  aggiornaData(dipendente, chatId, resp);
});





/* Helper cancella */
bot.onText(/^\/cancella$/, async (msg, match) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Per cancellare una data usa il comando /cancella <nome dipendente: sergio> <dd-mm-yyyy: 01-01-2022>"
  );
});


bot.onText(/\/cancella (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!check_if_allowed(msg.from.username, chatId, user_allowed)) {
    bot.sendMessage(
      chatId,
      "Utente non autorizzato, il tuo user è:" + username
    );
    return;
  }
  if (!match[1]) {
    bot.sendMessage(
      chatId,
      "Per cancellare una data usa il comando /cancella <nome dipendente: sergio> <dd-mm-yyyy: 01-01-2022>"
    );
    return;
  }
  let components = match[1].split(" ");
  //console.log(components);
  resp = components[0].toLocaleLowerCase();
  if (!resp) {
    bot.sendMessage(
      chatId,
      "Per cancellare una data usa il comando /cancella <nome dipendente: sergio> <dd-mm-yyyy: 01-01-2022>"
    );
    return;
  }
  let dipendente = "";
  dipendente = getDipendente(resp);
  if (!dipendente) {
    bot.sendMessage(
      chatId,
      "Non hai inviato nessun nome presente nella lista dipendenti"
    );
    return;
  }
  data = components[1];
  if (!data) {
    bot.sendMessage(
      chatId,
      "Per cancellare una data usa il comando /cancella <nome dipendente: sergio> <dd-mm-yyyy: 01-01-2022>"
    );
    return;
  }
  if (!moment(data, 'DD-MM-YYYY', true).isValid()) {
    bot.sendMessage(chatId, 'Inserire una data nel formato DD-MM-YYYY (es: 25-01-2022)');
    return;
  }

  executeQuery(
    `delete from entrate where giornata = "${data}" and nome = "${dipendente}"`,
    function (error, result) {
      if (error) {
        bot.sendMessage(chatId, "Si è verificato un errore durante l'eliminazione dell'entrata " + error);
        console.log(error);
      } else {
        if (result.affectedRows >= 1) {
          bot.sendMessage(chatId, `Ciao ${resp} hai cancellato l'entrata di ${dipendente} del giorno ${data} ${emoji.white_check_mark}`);
        } else {
          bot.sendMessage(chatId, "Non sono presenti entrate nella data inserita per il dipendente impostato");
        }
      }
    }
  );
});



/* Helper dataingresso */
bot.onText(/^\/dataingresso$/, async (msg, match) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Per inserire un'entrata usa il comando /dataingresso <nome dipendente: sergio> <dd-mm-yyyy: 01-01-2022> <hh-mm: 16:00>"
  );
});

/* Gestione DATAINGRSSO + NOME + GIORNATA + ORARIO  */
bot.onText(/\/dataingresso (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  if (!check_if_allowed(msg.from.username, chatId, user_allowed)) {
    bot.sendMessage(
      chatId,
      "Utente non autorizzato, il tuo user è:" + username
    );
    return;
  }
  if (!match[1]) {
    bot.sendMessage(
      chatId,
      "Per inserire un'entrata usa il comando /dataingresso <nome dipendente: sergio> <dd-mm-yyyy: 01-01-2022> <hh-mm: 16:00>"
    );
    return;
  }
  let components = match[1].split(" ");
  //console.log(components);
  resp = components[0].toLocaleLowerCase();
  if (!resp) {
    bot.sendMessage(
      chatId,
      "Per inserire un'entrata usa il comando /dataingresso <nome dipendente: sergio> <dd-mm-yyyy: 01-01-2022> <hh-mm: 16:00>"
    );
    return;
  }
  let dipendente = "";
  dipendente = getDipendente(resp);
  if (!dipendente) {
    bot.sendMessage(
      chatId,
      "Non hai inviato nessun nome presente nella lista dipendenti"
    );
    return;
  }
  data = components[1];
  if (!data) {
    bot.sendMessage(
      chatId,
      "Per inserire un'entrata usa il comando /dataingresso <nome dipendente: sergio> <dd-mm-yyyy: 01-01-2022> <hh-mm: 16:00>"
    );
    return;
  }
  if (!moment(data, 'DD-MM-YYYY', true).isValid()) {
    bot.sendMessage(chatId, 'Inserire una data nel formato DD-MM-YYYY (es: 25-01-2022)');
    return;
  }
  orario = components[2];
  if (!orario) {
    bot.sendMessage(
      chatId,
      "Per inserire un'entrata usa il comando /dataingresso <nome dipendente: sergio> <dd-mm-yyyy: 01-01-2022> <hh-mm: 16:00>"
    );
    return;
  }
  executeQuery(
    `insert into entrate (nome, giornata, entrata) values ("${dipendente}", "${data}", "${orario + ':00'}")`,
    function (error, result) {
      if (error) {
        bot.sendMessage(chatId, "Si è verificato un errore durante l'inserimento dell'entrata " + error);
        console.log(error);
      } else {
        bot.sendMessage(chatId, "Ciao " + resp + " entrata inserita " + emoji.white_check_mark);
      }
    }
  );
});



/* Helper datauscita */
bot.onText(/^\/datauscita$/, async (msg, match) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Per inserire un'uscita usa il comando /datauscita <nome dipendente: sergio> <dd-mm-yyyy: 01-01-2022> <hh-mm: 16:00>"
  );
});



/* Gestione DATAUSCITA + NOME + GIORNATA + ORARIO */
bot.onText(/\/datauscita (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!check_if_allowed(msg.from.username, chatId, user_allowed)) {
    bot.sendMessage(
      chatId,
      "Utente non autorizzato, il tuo user è:" + username
    );
    return;
  }
  if (!match[1]) {
    bot.sendMessage(
      chatId,
      "Per inserire un'uscita usa il comando /datauscita <nome dipendente: sergio> <dd-mm-yyyy: 01-01-2022> <hh-mm: 16:00>"
    );
    return;
  }
  let components = match[1].split(" ");
  //console.log(components);
  resp = components[0].toLocaleLowerCase();
  if (!resp) {
    bot.sendMessage(
      chatId,
      "Per inserire un'uscita usa il comando /datauscita <nome dipendente: sergio> <dd-mm-yyyy: 01-01-2022> <hh-mm: 16:00>"
    );
    return;
  }
  let dipendente = "";
  dipendente = getDipendente(resp);
  if (!dipendente) {
    bot.sendMessage(
      chatId,
      "Non hai inviato nessun nome presente nella lista dipendenti"
    );
    return;
  }
  data = components[1];
  if (!data) {
    bot.sendMessage(
      chatId,
      "Per inserire un'uscita usa il comando /datauscita <nome dipendente: sergio> <dd-mm-yyyy: 01-01-2022> <hh-mm: 16:00>"
    );
    return;
  }
  if (!moment(data, 'DD-MM-YYYY', true).isValid()) {
    bot.sendMessage(chatId, 'Inserire una data nel formato DD-MM-YYYY (es: 25-01-2022)');
    return;
  }
  orario = components[2];
  if (!orario) {
    bot.sendMessage(
      chatId,
      "Per inserire un'uscita usa il comando /datauscita <nome dipendente: sergio> <dd-mm-yyyy: 01-01-2022> <hh-mm: 16:00>"
    );
    return;
  }
  aggiornaDataPassata(dipendente, chatId, resp, data, orario);
});


/* Helper vedi */
bot.onText(/^\/vedi$/, async (msg, match) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Per visualizzare tutte gli ingressi e le uscite di una data lanciare il comando /vedi <dd-mm-yyyy: 01-01-2022>"
  );
});

/* Gestione DATAINGRSSO + NOME + GIORNATA + ORARIO  */
bot.onText(/\/vedi (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  if (!check_if_allowed(msg.from.username, chatId, user_allowed)) {
    bot.sendMessage(
      chatId,
      "Utente non autorizzato, il tuo user è:" + username
    );
    return;
  }
  if (!match[1]) {
    bot.sendMessage(
      chatId,
      "Per visualizzare tutte le entrate e le uscite di una data lanciare il comando /vedi <dd-mm-yyyy: 01-01-2022>"
    );
    return;
  }
  let components = match[1].split(" ");
  //console.log(components);
  data = components[0];
  if (!data) {
    bot.sendMessage(
      chatId,
      "Per visualizzare tutte le entrate e le uscite di una data lanciare il comando /vedi <dd-mm-yyyy: 01-01-2022>"
    );
    return;
  }
  if (!moment(data, 'DD-MM-YYYY', true).isValid()) {
    bot.sendMessage(chatId, 'Inserire una data nel formato DD-MM-YYYY (es: 25-01-2022)');
    return;
  }

  executeQuery(
    `select * from entrate where giornata = "${data}"`,
    function (error, result) {
      if (error) {
        bot.sendMessage(chatId, "Si è verificato un errore durante la riceca della data (funzione vedi) dell'entrata " + error);
        console.log(error);
      } else {
        if (result.length >= 1) {
          result.forEach(entrata => {
            bot.sendMessage(chatId, `${entrata.nome} - Giorno: ${entrata.giornata} - Entrata: ${entrata.entrata} - Uscita: ${entrata.uscita}`);
          });
        } else {
          bot.sendMessage(chatId, "Nessuna entrata rilevata per questa data: " + data);
        }
      }
    }
  );
});



/* Gestione RISPOSTA + KEYBOARD */
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Seleziona uno dei comandi " + emoji.memo , {
    reply_markup: {
      resize_keyboard:true,
      keyboard: [
        ["/entra", "/esci"],
        ["/comandi"]
      ],
    },
  });
});


/* Gestione RISPOSTA + KEYBOARD */
bot.onText(/^\/comandi$/, (msg) => {
  chatId = msg.chat.id;
  //var menu = ["/entra", "/esci", "/ingresso <nome>", "/uscita <nome>", "/dataingresso <nome> <giorno> <orario>", "/datauscita <nome> <giorno> <orario>", "/cancella <nome> <giorno>"];
  var menu2 = ["/entra", "/esci", "/ingresso", "/uscita", "/dataingresso", "/datauscita", "/cancella"];


  var options = {
    reply_markup: JSON.stringify({
      inline_keyboard: menu2.map((x, xi) => ([{
        text: x,
        callback_data: x,
      }])),
    }),
  };
  bot.sendMessage(chatId, 'Ecco la lista dei comandi', options);
});

bot.on("callback_query", (callbackQuery) => {
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;
  var dispatchData = callbackQuery.data;
  dispatchData = dispatchData.replace('/', '');
  bot.answerCallbackQuery(callbackQuery.id)
    .then(() => {
      switch (dispatchData) {
        case 'entra':
          bot.sendMessage(chatId, "Utilizza il comando /entra per fissare la tua entrata nella data di oggi nell'orario attuale " + emoji.raised_hand);
          break;
        case 'esci':
          bot.sendMessage(chatId, "Utilizza il comando /esci per fissare la tua uscita nella data di oggi nell'orario attuale "+ emoji.walking);
          break;
        case 'ingresso':
          bot.sendMessage(chatId, "Per fissare l'ingresso di un dipendente nella data di oggi all'orario attuale inserire il comando /ingresso <nome dipendente: sergio> "+ emoji.office);
          break;
        case 'uscita':
          bot.sendMessage(chatId, "Per fissare l'uscita di un dipendente nella data di oggi all'orario attuale inserire il comando /uscita <nome dipendente: sergio> " + emoji.watch);
          break;
        case 'dataingresso':
          bot.sendMessage(chatId, "Per inserire un'entrata in una data e ad un orario specifico usa il comando /dataingresso <nome dipendente: sergio> <dd-mm-yyyy: 01-01-2022> <hh-mm: 16:00> "+ emoji.calendar);
          break;
        case 'datauscita':
          bot.sendMessage(chatId, "Per inserire un'entrata in una data e ad un orario specifico usa il comando /datauscita <nome dipendente: sergio> <dd-mm-yyyy: 01-01-2022> <hh-mm: 16:00> "+ emoji.calendar);
          break;
        case 'cancella':
          bot.sendMessage(chatId, "Per cancellare una data usa il comando /cancella <nome dipendente: sergio> <dd-mm-yyyy: 01-01-2022> "+ emoji.red_circle);
          break;
        case 'vedi':
          bot.sendMessage(chatId, "Per visualizzare tutte gli ingressi e le uscite di una data lanciare il comando /vedi <dd-mm-yyyy: 01-01-2022> " + emoji.memo);
          break;
        default:
          bot.sendMessage(msg.chat.id, "Non hai selezionato nessuno dei comandi disponibili. Per visualizzare la lista dei comandi invia /comandi "+ emoji.rotating_light);
          break;
      }
    });
});

bot.on("polling_error", console.log);

bot.on("error", console.log);



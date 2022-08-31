require("dotenv").config();
var executeQuery = require("./sqlConn");
var moment = require("moment");
var emoji = require('node-emoji').emoji;
const bot = require('./index');

function check_if_allowed(username, chatId, user_allowed) {
    if (user_allowed.includes(username)) {
      return true;
    } else {
      return false;
    }
  }


  function who_is(username) {
    switch(username){
      case 'SergioBen':
        return 'sergio';
      default:
         return;
    }
  }


  function getDipendente(resp){
    switch (resp) {
      case "sergio":
        return process.env.sergio;
      case "stefano":
        return process.env.stefano;
      case "valentina":
        return process.env.valentina;
      case "daniele":
        return process.env.daniele;
      default:
        return;
    }
  }

  
function getResp(match = null, username){
    if(match){
      let resp = match;
      resp = resp.toLowerCase();
      return resp;
    } else {
      resp = who_is(username);
      if(!resp){
        return;
      } else {
        return resp;
      }
    }
  }
  
  
  function aggiornaData(dipendente, chatId, resp){
      var dataUscita = moment().format("DD-MM-YYYY"); 
      executeQuery(
          //`UPDATE entrate set uscita = '${moment().format("HH:mm:ss")}' where id = (SELECT MAX(id) FROM entrate WHERE nome= "${dipendente}" and uscita is null and giornata = "${moment().format('DD-MM-YYYY')}"); `,
          `UPDATE entrate set uscita = '${moment().format("HH:mm:ss")}' where id = (SELECT * FROM (SELECT MAX(id) FROM entrate WHERE nome= "${dipendente}" and uscita is null and giornata = "${moment().format('DD-MM-YYYY')}")_alias);`,
          function (error, result) {
            if (error) {
              bot.sendMessage(chatId, "Si è verificato un errore durante l'inserimento "+ error);
              console.log(error);
            } else {
              if(result.affectedRows >= 1){
                  bot.sendMessage(chatId, "Ciao " + resp + " uscita inserita " + emoji.calendar);
              } else {
                  bot.sendMessage(chatId, "Hai già segnalato l'uscita di oggi");
              }
            }
          }
        );
  }


  function aggiornaDataPassata(dipendente, chatId, resp, data, orario){
    var dataUscita = moment().format("DD-MM-YYYY"); 
    executeQuery(
        //`UPDATE entrate set uscita = '${orario+':00'}' where id = (SELECT MAX(id) FROM entrate WHERE nome= "${dipendente}" and uscita is null and giornata = "${data}"); `,
        `UPDATE entrate set uscita = '${orario+':00'}' where id = (SELECT * FROM (SELECT MAX(id) FROM entrate WHERE nome= "${dipendente}" and uscita is null and giornata = "${data}")_alias);`,
        function (error, result) {
          if (error) {
            bot.sendMessage(chatId, "Si è verificato un errore durante l'inserimento "+ error);
            console.log(error);
          } else {
            //console.log(result);
            if(result.affectedRows >= 1){
                bot.sendMessage(chatId, "Ciao " + resp + " uscita passata inserita " + emoji.calendar);
            } else {
                bot.sendMessage(chatId, "Hai già segnalato l'uscita per quel giorno o data non trovata.");
            }
          }
        }
      );
}

  
function getData(dipendente, chatId){
    return new Promise((resolve, reject) => {
        executeQuery(
            `SELECT entrata FROM entrate WHERE id = (SELECT MAX(id) from entrate where nome = "${dipendente}" and giornata = "${moment().format('DD-MM-YYYY')}")`,
           function (error, result) {
              if (error) {
                bot.sendMessage(chatId, "Si è verificato un errore durante la ricerca della data di entrata "+ error);
                console.log(error);
              } else {
                if(!result[0]){
                    console.log('Nessun risultato trovato');
                    trovato = false;
                    /*return trovato;
                    resolve();*/
                } else {
                    dataEntrata = result[0].entrata;
                    //console.log('getDataEntrata '+ dataEntrata);
                    trovato = dataEntrata;
                    /*return trovato;
                    resolve();*/
                }
                resolve(trovato);
            }
          }
        );
    });
    
}


  module.exports = {
    check_if_allowed,
    who_is,
    getDipendente,
    getResp,
    aggiornaData,
    aggiornaDataPassata,
    getData
  }
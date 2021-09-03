import { Parser } from 'hot-formula-parser';
import {decode} from './crypto';

const parser = new Parser();


//define custom function of Parser
parser.setFunction('ADD_5', function(params) {
    return params[0] + 5;
});

parser.setFunction('DATE', function(params) {
    var result;
    var now = new Date();
    switch (params[0].toUpperCase()) {
      case "TODAY":
        result = now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate(); //"2019-10-15"
        break;
      default:
        result = new Date();
        break;
    }
    return result;
  });


parser.setFunction('GET_USER', function(params) {
  var user = JSON.parse(decode(localStorage.user))
    //params("me/email", ["firstname", "lastname", "email", "fullname"])
    var result = '';
    switch (params[0].toUpperCase()) {
      case "ME":
        switch (params[1]) {
          case "firstname":
            //assuming the firstname we found is "Jane"
            result = user.firstname;
            break;
          case "lastname":
            result = user.lastname;
            break;
          case "fullname":
            result = user.firstname + " " + user.lastname;
            break;
          default:
            result = "invalid field";
            break;
        };
        break;
      default:
        result = params[1]+" of "+params[0];
        break;
    };
    return result;
  });

  

export default parser
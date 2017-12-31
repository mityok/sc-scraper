const htmlparser= require('htmlparser2');
const cnst = require('./sc_const.js');

const parseMainPage = body => {
  return new Promise((resolve, reject) => {
    let an = false
    const links = [];
    var parsedData = new htmlparser.Parser({   
      onopentag: (name, attribs) => {
        if (name === 'a' && attribs.href && attribs.href.split('/').length === 5 && attribs.href.indexOf(cnst.MAIN_PAGE) > 0) {
          const obj = {
            href: attribs.href
          };
          links.push(obj);
          an = true;
        }
        if (name === 'img' && an) {
          links[links.length - 1].src = attribs.src
        }      
      },
      onclosetag: (a, b, c) => {
        if (a === 'a') {
          an = false;
        }
      },
      onend: () => {   
        resolve(links)  
      }  
    }, {decodeEntities: true});  
    parsedData.write(body);  
    parsedData.end();
  })
}
const parsePhotosPage = body => {
  return new Promise((resolve, reject) => {
    const links = [];
    var parsedData = new htmlparser.Parser({   
      ontext: text => {
        const isValid = text.indexOf('Photo')===0 && text.indexOf('Issue')>0;
        if(isValid){
          var numberPattern = /\d+/g; 
          const arr = text.match(numberPattern);
          if(arr && arr.length){
            links.push(parseInt(arr[0],10))
          }
        }
      },
      onend: () => {   
        resolve(links)  
      }  
    }, {decodeEntities: true});  
    parsedData.write(body);  
    parsedData.end();
  })
}
module.exports={parseMainPage,parsePhotosPage};
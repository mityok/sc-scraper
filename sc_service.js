var fs = require('fs');
var http = require('http');
const utils = require("./sc_utils.js");
const genUtil = require('./sc_gen_utils.js');
const cnst = require('./sc_const.js');
var crypto = require('crypto');

const getLink = (name, gallery, index) => `${name.substring(0,2)}${gallery}x${('000'+index).slice(-3)}.jpg`
//
const getThumb = (name, gallery, index) => `tn_${getLink(name,gallery,index)}`;

const loadHtml = url => {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let body = "";
      res.on("data", data => {
        body += data;
      });
      res.on("end", () => {
        resolve(body)
      });
    });
  })
}
const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      if (response.statusCode !== 200) {
        resolve({
          type: 'error',
          code: response.statusCode
        });
        return
      }
      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve({
          type: 'pass'
        });
      });
      file.on('error', err => {
        file.end();
        reject({message:err.message,url});
      })
    }).on('error', err => {
      fs.unlink(dest);
      reject({message:err.message,url});
    });
  })
};
const makeDir = dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}
const loadMainLink = link => {
  const photos = link.href.split('/')
  photos.pop()
  photos.push(cnst.PHOTOS_PAGE);
  console.log('end2', link.href, photos.join('/'));
  loadHtml(photos.join('/')).then(utils.parsePhotosPage).then(galleriesIds => {
  galleriesIds = genUtil.fixGalleryArray(galleriesIds);
  galleriesIds.splice(10);
    console.log('length', photos, galleriesIds.length, galleriesIds[0], galleriesIds[galleriesIds.length - 1]);
    
    return Promise.all(galleriesIds.map(id=>loadImages(photos,id)));
  }).then(arr => {
    console.log('loded', arr)
  }).catch((e) => {
    console.log('error', e, photos)
  })
}

const loadImages = (photos, galleryId) => {
  return loadAllImages(photos, galleryId).then(results=>{
    let index = cnst.MAX_PHOTOS;
    for(let i = 0; i < results.length; i++){
      if(results[i].type === 'error'){
        index = i;
        break;
      }
    }
    return Promise.resolve({index, galleryId, name: photos[photos.length-2]})
  })
}

const loadAllImages = (photos, galleryId) => {
  const arr = [];
  for (let j = 1; j <= cnst.MAX_PHOTOS; j++) {
    const href = [...photos];
    href.pop();
    const name = href[href.length - 1];
    href.push(getThumb(name, galleryId, j));
    arr.push(writeThumb(name, galleryId, j, href.join('/')));
  }
  return Promise.all(arr);
}

const writeThumb = (name, gallery, index, thumb) => {
  //console.log('b', name, thumb);
  makeDir(`${cnst.MAIN_DIR}/${name}/${gallery}`);
  makeDir(`${cnst.MAIN_DIR}/${name}/${gallery}/tn`);
  return download(thumb, `${cnst.MAIN_DIR}/${name}/${gallery}/tn/${index}.jpg`);
}
const launch = ()=> {
  loadHtml(cnst.MAIN).then(utils.parseMainPage).then(links => {
    console.log('end3', links[1]);
    loadMainLink(links[1]);
    //writeLinks(links);
  })
}

const init = () => {
  genUtil.prompt('pass').then( responce => {
    responce=responce.split(String.fromCharCode(10))[0];
    console.log('p',responce,'-');
    cnst.MAIN = decif(responce);
    console.log('-',cnst.MAIN,'-');
    launch();
  }).catch(e=>{
    console.log('ERR -',e.message);
    process.exit();
  })
}
const decif = pass => {
  var decipher = crypto.createDecipher('aes-128-cbc', pass);
  var dec = decipher.update( cnst.KEY, 'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

const writeLinks = links => {
  makeDir(cnst.MAIN_DIR)
  links.forEach(link => {
    const dir = link.href.split('/')[3];
    const file = link.src.split('/').pop();
    makeDir(`${cnst.MAIN_DIR}/${dir}`)
    download(link.src, `${cnst.MAIN_DIR}/${dir}/${file}`);
  })
  console.log('done4');
}
module.exports = {
  init
}
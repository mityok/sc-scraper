const prompt = question => {
  const stdin = process.stdin,
        stdout = process.stdout;
  stdin.setEncoding('utf8');
  stdin.setRawMode(true);
  stdin.resume();
  question=`${question}: `
  stdout.write(question);
  return new Promise((resolve, reject)=>{
  let password = ''
    stdin.on('data', ch => {
      ch = ch + "";

        switch (ch) {
        case "\n":
        case "\r":
        case "\u0004":
            // They've finished typing their password
            stdout.write('\n');
            stdin.setRawMode(false);
            stdin.pause();
            resolve(password);
            break;
        case "\u0003":
            // Ctrl-C
            reject('exit')
            break;
        default:
            // More passsword characters
            stdout.write('*');
            password += ch;
            break;
        }
      
    })
  });
}

const fixGalleryArray = arr => {	
  const RESET = 999;
  let prevValue = -1;
  let prevValidValue = RESET;
  const fixedArr = [];
  for (let i = 0; i < arr.length; i++) {
    if (prevValue !== -1) {
      const delta = arr[i] - prevValue;
      if (delta > -1) {
        if (prevValidValue === RESET) {
          prevValidValue = prevValue;
        }
        prevValidValue--;
        fixedArr.push(prevValidValue);
      } else if (delta < -1) {
        prevValidValue = RESET;
        fixedArr.push(arr[i]);
      } else {
        if (prevValidValue === RESET) {
          fixedArr.push(arr[i]);
        }else{
          prevValidValue--;
          fixedArr.push(prevValidValue);
        }
      }
    } else {
      fixedArr.push(arr[i]);
    }
    prevValue = arr[i];
  }
  return fixedArr;
}

module.exports={fixGalleryArray,prompt};
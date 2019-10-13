const puppeteer = require('puppeteer');
const fs = require('fs');
const levenshtein = require('fast-levenshtein');
const lev = levenshtein.get;
const urls = [
"https://www.google.com/search?psb=1&tbm=shop&q=laptop&ved=0CAQQr4sDKAJqFwoTCOfAsvPfleUCFXMNCgMdxs0M5BAB",
"https://www.google.com/search?tbm=shop&sxsrf=ACYBGNT6K4lb26_FYpzCe6mV9yB4X3gfhA%3A1570835838836&psb=1&x=0&y=0&q=tv&oq=tv&aqs=products-cc..0l10",
"https://www.google.com/search?tbm=shop&sxsrf=ACYBGNRzLIMJ8q47cmwLcSygic0DKMLseA%3A1570835843636&psb=1&x=0&y=0&q=gaming&oq=gaming&aqs=products-cc..0l10",
"https://www.google.com/search?tbm=shop&sxsrf=ACYBGNTmP9AUUsC68UX1mUPqVvjxUvb4XA%3A1570835930200&psb=1&x=0&y=0&q=microphone&oq=microphone&aqs=products-cc..0l10",
"https://www.google.com/search?tbm=shop&sxsrf=ACYBGNQi1lyaQ3s-x3sy5rCwblKgzMkCoQ%3A1570835948809&psb=1&x=0&y=0&q=camera&oq=camera&aqs=products-cc..0l10",
"https://www.google.com/search?tbm=shop&sxsrf=ACYBGNTcnA2KyBAYtzu3tbwpnUnW4Gk8bQ%3A1570836222602&psb=1&x=0&y=0&q=mobile&oq=mobile&aqs=products-cc..0l10",
"https://www.google.com/search?tbm=shop&sxsrf=ACYBGNSm9M011W3wnyT6eYDCT0MhEP8O-Q%3A1570836238774&psb=1&x=0&y=0&q=tab&oq=tab&aqs=products-cc..0l10",
"https://www.google.com/search?tbm=shop&sxsrf=ACYBGNRb3lOG0cJ4Pd2ZEZifmB2vtlU0Gw%3A1570836254813&psb=1&x=0&y=0&q=battery&oq=battery&aqs=products-cc..0l10",
"https://www.google.com/search?tbm=shop&sxsrf=ACYBGNSqmMzNSme-6_KQfIbucF-Bi0Q73A%3A1570836292251&psb=1&x=0&y=0&q=printer&oq=printer&aqs=products-cc..0l10",
"https://www.google.com/search?tbm=shop&sxsrf=ACYBGNRmCgIUXtzJP3mumLmL4jfhLRctoQ%3A1570836361361&psb=1&x=0&y=0&q=bulb&oq=bulb&aqs=products-cc..0l10",
"https://www.google.com/search?tbm=shop&sxsrf=ACYBGNQaDRCMF4OhuePMfK9BFjbSpus26w%3A1570836398137&psb=1&x=0&y=0&q=facewash&oq=facewash&aqs=products-cc..0l10",
"https://www.google.com/search?tbm=shop&sxsrf=ACYBGNTQLbh26K2HsimbXT5PqOqGpD2Bsg%3A1570836475490&psb=1&x=0&y=0&q=shampoo&oq=shampoo&aqs=products-cc..0l10",
"https://www.google.com/search?tbm=shop&sxsrf=ACYBGNQxuCf7VVMZq4svP86EuCO1Ky2H6Q%3A1570836488860&psb=1&x=0&y=0&q=trimmer&oq=trimmer&aqs=products-cc..0l10",
"https://www.google.com/search?tbm=shop&sxsrf=ACYBGNSMtBbnHQe71whqCmZnxAbx3PqcLw%3A1570839550726&psb=1&x=0&y=0&q=detergents&oq=detergents&aqs=products-cc..0l10",
"https://www.google.com/search?tbm=shop&sxsrf=ACYBGNR9_-GL-W-UGOAjYHegtGohb2JREQ%3A1570839613235&psb=1&x=0&y=0&q=paste&oq=paste&aqs=products-cc..0l10",
"https://www.google.com/search?tbm=shop&sxsrf=ACYBGNQWUhWSKvjXATaV7dAPa7-FLBlROg%3A1570839715250&psb=1&x=0&y=0&q=gum&oq=gum&aqs=products-cc..0l10",
"https://www.google.com/search?tbm=shop&sxsrf=ACYBGNTn5Iyp9ZLcO9KVmjoxhBanW_0wTg%3A1570839772110&psb=1&x=0&y=0&q=the+power+of+habit&oq=the+power+of+&aqs=products-cc.1.0l10",
"https://www.google.com/search?tbm=shop&sxsrf=ACYBGNSucnkAM_iE5FoMOeuZxKenIL4ErQ%3A1570840108273&psb=1&x=0&y=0&q=knife&oq=knife&aqs=products-cc..0l10",
"https://www.google.com/search?tbm=shop&sxsrf=ACYBGNRH77BcyPPaypsVpkmDV0KI0ZNJFA%3A1570840119058&psb=1&x=0&y=0&q=bread&oq=bread&aqs=products-cc..0l10",
"https://www.google.com/search?tbm=shop&sxsrf=ACYBGNS1kaXqMTxXv4vHwIUilKsGQpCbrw%3A1570840158011&psb=1&x=0&y=0&q=egg&oq=egg&aqs=products-cc..0l10",
"https://www.google.com/search?tbm=shop&sxsrf=ACYBGNTEqX5iaX-Zfw3Zgbdv2q4_Ev4TvA%3A1570840177378&psb=1&x=0&y=0&q=milk&oq=milk&aqs=products-cc..0l10",
"https://www.google.com/search?tbm=shop&sxsrf=ACYBGNShKtTcEv8VT3rqiqk6Nzr-eDO12w%3A1570840217135&psb=1&x=0&y=0&q=diary&oq=diary&aqs=products-cc..0l10",
"https://www.google.com/search?tbm=shop&sxsrf=ACYBGNSHCeiVu06nB-hgmHvudkbHdjT2VA%3A1570840273422&psb=1&x=0&y=0&q=cycle&oq=cycle&aqs=products-cc..0l10",
"https://www.google.com/search?tbm=shop&sxsrf=ACYBGNTnJRrNEou-hnulnbyzHPrlJpt6Qw%3A1570840295758&psb=1&x=0&y=0&q=refrigerator&oq=refrige&aqs=products-cc.0.0l10",
"https://www.google.com/search?tbm=shop&sxsrf=ACYBGNRksjKNNyxcwW38HEkiUn7BPuldaA%3A1570840306613&psb=1&x=0&y=0&q=fan&oq=fan&aqs=products-cc..0l10",
"https://www.google.com/search?tbm=shop&sxsrf=ACYBGNRRWJAuhqhNMG6UgewNC4yHTiA7Rg%3A1570840321239&psb=1&x=0&y=0&q=tubelight&oq=tubelight&aqs=products-cc..0l10",
"https://www.google.com/search?tbm=shop&sxsrf=ACYBGNQ1f8BQ59NT-kpbgL-kWe6w1BnRew%3A1570840356076&psb=1&x=0&y=0&q=fivestar&oq=fivestar&aqs=products-cc..0l10"
]
var bounding_boxes_file = fs.createWriteStream('./bounding_boxes.txt');
var index_file = fs.createWriteStream('./index.txt');
var PImage = require('pureimage');
const MAX_WIDTH = 1280
const MAX_HEIGHT = 1280
async function bounding_boxes_of_leaf_nodes(page, price, title) {
  console.log('registering console...')
  page.on('console', consoleObj => console.log(consoleObj.text()));
  //await page.exposeFunction('lev', lev);
  console.log('before entering race...')
  return Promise.race([page.evaluate(async (price, title) => {
                               // let onlyUnique = function(value, index, self) {
                               //   return self.indexOf(value) === index;
                               // }
                              // const title_words = title.split(" ");
                               if (price.split('.')[1] === '00') {
                                 price = price.split('.')[0].substring(1)
                               } else {
                                 price = price.substring(1)
                               }
                               let alternative_price = price;
                               let tmp = 0;
                               console.log('checking if the price has an alternative...');
                               while ((tmp = alternative_price.indexOf(',')) !== -1) {
                                 alternative_price = alternative_price.substring(0, tmp) + price.substring(tmp+1)
                               }
                               if (alternative_price === price) {
                                 alternative_price = undefined
                               }
                               console.log(price, alternative_price, title);

                               const nodes = document.querySelectorAll("*");
                               let bounding_boxes = [];

                               let max_price_area = 0;
                               let price_idx = -1;

                               // let max_title_font_size = 0;
                               // let max_common_words = 0;
                               // let min_title_dist = title.length;
                               // let title_idx = -1;
                               // let title_text = null;

                               let elem_idx = 0;

                               for (let elem of nodes) {
                                 let isLeaf = true;
                                 if (elem.hasChildNodes()) {
                                   for (var i = 0; i < elem.childNodes.length; i++) {
                                     if (elem.childNodes[i].nodeType == 1) {
                                       isLeaf = false; break;
                                     }
                                   }
                                 }
                                 if (isLeaf && elem.textContent && elem.textContent.length) {
                                   const {top, left, bottom, right} = elem.getBoundingClientRect();
                                   const box = {'x': left, 'y': top, 'width': right - left, 'height': bottom - top};
                                   if (box.width > 1 && box.height > 1 && box.x >= 0 && box.y >= 0 && box.y + box.height <= 1280) {
                                     if ((elem.textContent.includes(price) || (alternative_price && elem.textContent.includes(alternative_price))) && elem.textContent.replace(/\s/g, '').length <= price.length + 5) {
                                       let area = box.width * box.height;
                                       if (area > max_price_area) {
                                         max_price_area = area;
                                         price_idx = elem_idx;
                                       }
                                     }
                                     //

                                     // if (elem.textContent.length <= 2 * title.length) {
                                     //   let text_words = elem.textContent.split(" ").filter(onlyUnique);
                                     //   let count = 0;
                                     //   for (let word of text_words) {
                                     //     if (title_words.indexOf(word) !== -1) {
                                     //       count ++;
                                     //     }
                                     //   }
                                     //   if (count > max_common_words) {
                                     //     max_common_words = count;
                                     //     title_idx = elem_idx;
                                     //     max_title_font_size = parseFloat(window.getComputedStyle(elem, null).getPropertyValue('font-size'));
                                     //   } else if (count == max_common_words) {
                                     //     let font_size = parseFloat(window.getComputedStyle(elem, null).getPropertyValue('font-size'));
                                     //     if (font_size > max_title_font_size) {
                                     //       max_title_font_size = font_size;
                                     //       max_common_words = count;
                                     //       title_idx = elem_idx;
                                     //     }
                                     //   }
                                       // let font_size = parseFloat(window.getComputedStyle(elem, null).getPropertyValue('font-size'));
                                       // if (font_size > max_title_font_size) {
                                       //   max_title_font_size = font_size;
                                       //   title_idx = elem_idx;
                                       //   title_text = elem.textContent.replace(/\s/g,'');
                                       // } else if (font_size == max_title_font_size) {
                                       //   let dist1 = await window.lev(title, title_text);
                                       //   let dist2 = await window.lev(title, elem.textContent.replace(/\s/g,''));
                                       //   if (dist2 < dist1) {
                                       //     title_idx = elem_idx;
                                       //     title_text = elem.textContent.replace(/\s/g,'');
                                       //   }
                                       // }

                                       // dist = await window.lev(elem.textContent.replace(/\s/g,''), title);
                                       // //console.log(dist)
                                       // if (dist < min_title_dist) {
                                       //   min_title_dist = dist;
                                       //   title_idx = elem_idx;
                                       // }
                                     //}

                                     bounding_boxes.push(box);
                                     elem_idx ++;
                                   }
                                 }
                               }
                               // if (price_idx === -1 || title_idx === -1) {
                               //   return null
                               // }
                               if (price_idx === -1) {
                                 console.log('no price found')
                                 return null;
                               }
                               // let max_index = 0
                               // //Perhaps also consider font size.
                               // for (let i = 0; i < potential_match_num; i++) {
                               //   if (bounding_boxes[i].width * bounding_boxes[i].height >
                               //      bounding_boxes[max_index].width * bounding_boxes[max_index].height) {
                               //        max_index = i;
                               //      }
                               // }
                               // if (max_index !== 0) {
                               //   const tmp = bounding_boxes[0];
                               //   bounding_boxes[0] = bounding_boxes[max_index];
                               //   bounding_boxes[max_index] = tmp;
                               // }
                               //console.log(min_title_dist)

                               if (price_idx !== 0) {
                                 const tmp = bounding_boxes[0];
                                 bounding_boxes[0] = bounding_boxes[price_idx];
                                 bounding_boxes[price_idx] = tmp;
                               }
                               // if (title_idx !== 1) {
                               //   const tmp = bounding_boxes[1];
                               //   bounding_boxes[1] = bounding_boxes[title_idx];
                               //   bounding_boxes[title_idx] = tmp;
                               // }

                               const images = document.getElementsByTagName('img');
                               let max_image_idx = -1;
                               let max_image_size = 0;
                               for (let img of images) {
                                 if (img.textContent.length) {
                                  console.log('image has text content: ', img.textContent.length)
                                  return null;
                                 }
                                 const {top, left, bottom, right} = img.getBoundingClientRect();
                                 const box = {'x': left, 'y': top, 'width': right - left, 'height': bottom - top};
                                 if (box.width > 1 && box.height > 1 && box.x >= 0 && box.y >= 0 && box.y + box.height <= 1280) {
                                   let image_size = box.width * box.height;
                                   if (image_size > max_image_size) {
                                     max_image_size = image_size;
                                     max_image_idx = elem_idx;
                                   }
                                   bounding_boxes.push(box);
                                   elem_idx++;
                                 }
                               }

                               if (max_image_idx === -1) {
                                 console.log('no image found')
                                 return null;
                               }
                               if (max_image_idx !== 2) {
                                 const tmp = bounding_boxes[2];
                                 bounding_boxes[2] = bounding_boxes[max_image_idx];
                                 bounding_boxes[max_image_idx] = tmp;
                               }
                               return bounding_boxes;
                             }, price, title), new Promise(function(resolve, reject) {
                                  setTimeout(resolve, 1000, null);
                              })]);
}

// returns DOM tree root with all its descendents
// each node includes additional useful information - such as position, etc.
async function getDomTree(page) {
  return await page.evaluate( () => {
    baseurl = window.location

    var selected_style_props = ['display','visibility','opacity','z-index','background-image','content','image'];

    //-- get elements in processing order
    getElements = function() {
        var tree_stack = new Array();
        var result_stack = new Array();
        tree_stack.push(document);
        // if we have some other nodes
        while (tree_stack.length != 0){
            // get element
            el = tree_stack.pop();
            // put it in result stack
            result_stack.push(el);
            //add children of element to stack
            for (i=0;i<el.childNodes.length;i++){
                tree_stack.push(el.childNodes[i])
            }
        }
        return result_stack
    }

    //-- creates node with all information
    createNode = function(element){
        node = {};
        node.name = element.nodeName;
        node.type = element.nodeType;

        //VALUE
        if (element.nodeValue) {
            node.value =element.nodeValue;
        }
        //console.log(element.nodeType)
        //COMPUTED STYLE
        computed_style = undefined;
        try {
          computed_style = window.getComputedStyle(element);
        } catch(err) {}
        if (computed_style){
            node.computed_style = {}
            for (i=0;i<selected_style_props.length;i++){
                style_prop = selected_style_props[i]
                node.computed_style[style_prop]=computed_style[style_prop]
            }
        }
        //POSITION
        try{
            // IT HAS BOUNDINGCLIENTRECT
            if(typeof element.getBoundingClientRect === 'function') {
                bb = element.getBoundingClientRect()
                node.position = [Math.round(bb.left), Math.round(bb.top), Math.round(bb.right), Math.round(bb.bottom)]
            // TRY TO COMPUTE IT
            }else{
                bb = null
                var range = document.createRange();
                range.selectNodeContents(element);
                bb = range.getBoundingClientRect();
                if (bb){
                    node.position = [Math.round(bb.left), Math.round(bb.top), Math.round(bb.right), Math.round(bb.bottom)]
                }
            }
        }catch(err){}
        // ATRIBTURES
        attrs = element.attributes
        if (attrs){
            node.attrs = {}
            for (i=0;i<attrs.length;i++){
                node.attrs[attrs[i].nodeName] = attrs[i].nodeValue
            }
        }
        return node
    }

    //---------- RUN -----------//
    element_stack = getElements()
    processed_stack = new Array();

    while (element_stack.length != 0) {
        element = element_stack.pop();
        // node
        node = createNode(element)
        // add children
        if (element.childNodes.length>0){
            node.childNodes = []
            for (i=0; i<element.childNodes.length;i++){
                childNode = processed_stack.pop();
                node.childNodes.unshift(childNode);
            }
        }
        // add result to stack
        processed_stack.push(node)
        //console.log(processed_stack.length)
    }
    return processed_stack.pop()
  });
}

function saveDomTree(dom_tree_path, dom_tree) {
    var dom_tree_file = fs.createWriteStream(dom_tree_path);
    var dom_content = JSON.stringify(dom_tree);
    dom_tree_file.write(dom_content);
    dom_tree_file.end();
};

function imagesHaveLoaded() { return Array.from(document.images).every((i) => i.complete); }

async function generate_dataset(browser, page, url, pic_name_offset) {
  try {
    let offset = 0

    await page.goto(url, options={'waitUntil': 'networkidle0', 'timeout': 10000})
    await page.waitForFunction(imagesHaveLoaded);
    //await page.waitFor(3)

    while (true) {
      await page.waitForSelector('.ZGFjDb')
      const box_elements = await page.$$('.ZGFjDb')
      await page.waitForSelector('.AGVhpb')
      const content_elements = await Promise.all(box_elements.map(async e => {
        return await e.$$('.AGVhpb , .O8U6h span , .HZNWUb b')
      }));
      const contents = await Promise.all(content_elements.map(async (e_list) => {
        return await Promise.all(e_list.map(async e => {
          return await page.evaluate((e) => {return e.textContent}, e);
        }));
      }));
      console.log(contents)
      console.log(contents.length)

      for (let i = offset; i < offset + content_elements.length; i++) {
        if (fs.existsSync(`./screenshots/${i + pic_name_offset}.png`)) {
          fs.unlinkSync(`./screenshots/${i + pic_name_offset}.png`);
        }
        if (fs.existsSync(`./screenshots/${i + pic_name_offset}_rect.png`)) {
          fs.unlinkSync(`./screenshots/${i + pic_name_offset}_rect.png`);
        }
        if (contents[i - offset].length < 3) { //Which means the price is of the type $xx/mo
          if (contents[i - offset].length < 2) { //Which means something is not loaded properly
            console.log('page not loaded correctly')
            return -1;
          }
          continue
        }
        const content = content_elements[i - offset]
        console.log(i + pic_name_offset)
        await content[0].click()
        await page.waitFor(1000)
        const boxes = await page.$$('.sh-dp__cont')
        const outer_box = boxes[boxes.length - 1]
        const main_site_element = await outer_box.$('.shntl.translate-details-content')
        if (main_site_element) {
            const main_site_url = await page.evaluate((element) => element.href, main_site_element)
            const new_page = await browser.newPage()
            await new_page.evaluateOnNewDocument(() => {
              window.open = () => null;
            });
            new_page.on('dialog', async dialog => {
              console.log(dialog.message());
              await dialog.dismiss()
            })
            console.log(main_site_url)
            console.log('going to main site...')
            // try {
            //   await new_page.goto(main_site_url, {'timeout': 5000})
            // } catch(e) {
            //
            // }
        // //    let pageLoaded = false
            try {
              await new_page.goto(main_site_url, options={'waitUntil': 'networkidle0', 'timeout': 10000})
              await new_page.waitForFunction(imagesHaveLoaded, options={'timeout': 10000});
              await new_page.keyboard.press('Escape');
        //      pageLoaded = true
            } catch(e) {
               console.log('timeout, proceed anyway')
            //   await new_page.close()
            //   continue
            }
            //await new_page.waitFor(3)
            console.log('finding bounding boxes...')
            //bounding_boxes = await bounding_boxes_of_leaf_nodes(new_page, contents[i - offset][2].substring(1, contents[i - offset][2].length -3));
            bounding_boxes = await bounding_boxes_of_leaf_nodes(new_page, contents[i - offset][2], contents[i - offset][0]);
            if (!bounding_boxes) {
              //await new_page.screenshot({'path': `./screenshots/${i + pic_name_offset}.png`, 'clip': {'x':0, 'y':0, 'width':MAX_WIDTH, 'height':MAX_HEIGHT}})
              console.log('bouding_boxes: ', bounding_boxes);
              await new_page.close()
              continue
            }
            // await Promise.all(bounding_boxes.map(async (box, i) => {
            //   console.log(box
            //   return await new_page.screenshot({'path': `./leaves/${i}.png`, 'clip': box})
            // }))
            console.log('screenshotting...')
            await new_page.screenshot({'path': `./screenshots/${i + pic_name_offset}.png`, 'clip': {'x':0, 'y':0, 'width':MAX_WIDTH, 'height':MAX_HEIGHT}})
            await new_page.screenshot({'path': `./leaves/${i + pic_name_offset}.png`, 'clip': bounding_boxes[0]})

            let screenshot_file = fs.createReadStream(`./screenshots/${i + pic_name_offset}.png`)
            let img = await PImage.decodePNGFromStream(screenshot_file)
            var ctx = img.getContext('2d');
            ctx.fillStyle = 'rgba(255,0,0, 0.5)';
            console.log([bounding_boxes[0].x, bounding_boxes[0].y, bounding_boxes[0].width, bounding_boxes[0].height])
          //  console.log([bounding_boxes[1].x, bounding_boxes[1].y, bounding_boxes[1].width, bounding_boxes[1].height])
            console.log([bounding_boxes[2].x, bounding_boxes[2].y, bounding_boxes[2].width, bounding_boxes[2].height])
            ctx.fillRect(bounding_boxes[0].x, bounding_boxes[0].y, bounding_boxes[0].width, bounding_boxes[0].height);
          //  ctx.fillRect(bounding_boxes[1].x, bounding_boxes[1].y, bounding_boxes[1].width, bounding_boxes[1].height);
            ctx.fillRect(bounding_boxes[2].x, bounding_boxes[2].y, bounding_boxes[2].width, bounding_boxes[2].height);
            let modified_screenshot_file = fs.createWriteStream(`./screenshots/${i + pic_name_offset}_rect.png`)
            await PImage.encodePNGToStream(img, modified_screenshot_file)
            modified_screenshot_file.end()

          //  saveDomTree(`./dom/${i}.json`, await getDomTree(new_page))

            await new_page.close()
            bounding_box_data = []
            for (let bounding_box of bounding_boxes) {
              bounding_box_data.push([bounding_box.x, bounding_box.y, bounding_box.width, bounding_box.height]);
            }
            bounding_boxes_file.write(`${i + pic_name_offset} ${bounding_box_data.toString()}\n`)
            //index_file.write(`${i} ${contents[i - offset][0].toString()},${contents[i - offset][2].toString()}\n`)
            index_file.write(`${i + pic_name_offset} ${contents[i - offset][2].toString()}\n`)
        }
      }
      offset += 20;
      next_button = await page.$('#pnnext.pn')
      if(!next_button) {
        console.log('no next page, return')
        break
      }
      //break
      next_page_url = await page.evaluate((element) => element.href, next_button)
      console.log(next_page_url)
      await page.goto(next_page_url)
    }
    return offset;
  } catch (e) {
    console.log('This is an error that needs attention!!!!')
    console.error(e);
    return -1;
  }
}

(async () => {
  let browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], ignoreHTTPSErrors: true, dumpio: false, headless: false, defaultViewport: {width: 1280, height: 1280}});
  try {
    let pic_name_offset = 0;
    let page = await browser.newPage();
    let ret = 0;
    for (url of urls) {
      while ((ret = await generate_dataset(browser, page, url, pic_name_offset)) === -1) {
        await browser.close()
        browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], ignoreHTTPSErrors: true, dumpio: false, headless: false, defaultViewport: {width: 1280, height: 1280}});
        page = await browser.newPage();
      }
      console.log('ret = ', ret)
      pic_name_offset += ret
    }
  } catch (error) {
    console.error(error);
  } finally {
    await browser.close()
    bounding_boxes_file.end()
    index_file.end()
  }
  await browser.close()
  bounding_boxes_file.end()
  index_file.end()
})();

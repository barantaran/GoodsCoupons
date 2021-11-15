let greetingsBlock = document.getElementById("greetings");
let offersCount;

chrome.action.setBadgeText({text:''});

const buttonClearHandler = function(e) {
  let offerLinks = document.getElementById('offers-list');

  if (offersCount) {
    while (offerLinks.firstChild) {
      offerLinks.removeChild(offerLinks.firstChild);
    }

    greetingsBlock.innerHTML = "<h2>Поищем что-нибудь еще!</h2>";

    chrome.storage.local.remove("offersFound");
    delay(1000).then(() => window.close());
  } else {
    delay(100).then(() => window.close());
  }
}
function renderOffers(selector, offers) {
  offers.forEach((offerItem) => {
    console.log(offerItem);

    let tbody = document.querySelector(selector);
    let template = document.querySelector('#offer-row');

    let tmpClone = template.content.cloneNode(true).firstElementChild.outerHTML;

    let offerRow = renderRow(tmpClone, offerItem);

    tbody.insertAdjacentHTML('beforeend', offerRow);
  });
}

const clearButton = document.getElementById('offers-clear');
clearButton.addEventListener('click', buttonClearHandler);


chrome.storage.local.get("offersFound", ( offers ) => {

  if(!offers || !offers.offersFound.mainOffer || !offers.offersFound.mainOffer.length) return;

  offersCount = offers.offersFound.mainOffer.length + offers.offersFound.similarOffers.length;

  let mainOffer = offers.offersFound.mainOffer;
  let similarOffers = offers.offersFound.similarOffers;


  mainOffer.sort(compareOfferPrice);
  renderOffers('#main-offer', mainOffer);

  if(similarOffers){
    similarOffers.sort(compareOfferPrice);
    renderOffers('#similar-offers', similarOffers);
    document.getElementById("similar-offer-header").innerHTML = '<h3>С этим товаром также ищут:</h3>';
  }

  greetingsBlock.innerHTML = '<h3>' + offersCount + ' предложения</h3>';

});

function renderRow (template, data) {
  return template.replace(/{{(.*?)}}/g, (match) => {
    return data[match.split(/{{|}}/).filter(Boolean)[0]]
  })
}

function composeOfferLink(offer) {

  var offerLine = document.createElement('div');
  var offerLink = document.createElement('a');

  var offerText = document.createTextNode(offer.name.substring(0, 50));
  var offerPrice = document.createTextNode('... ' + offer.price + ' руб');

  offerLink.appendChild(offerText);

  offerLink.setAttribute('href', offer.url);
  offerLink.setAttribute('target', '_blank');
  offerLink.setAttribute('class', 'offer-item-link underline');
  offerLine.setAttribute('class', 'offer-item');


  offerLine.appendChild(offerLink);
  offerLine.appendChild(offerPrice);

  return offerLine;
}

function compareOfferPrice( offerOne, offerAnother ) {
  if ( parseInt(offerOne.price) < parseInt(offerAnother.price) ){
    return -1;
  }
  if ( parseInt(offerOne.price) > parseInt(offerAnother.price) ){
    return 1;
  }
  return 0;
}

function compareCategory( offerOne, offerAnother ) {
  if ( offerOne.category < offerAnother.category ){
    return -1;
  }
  if ( offerOne.category > offerAnother.category ){
    return 1;
  }
  return 0;
}

function compareName( offerOne, offerAnother ) {
  if ( offerOne.name.replace(/ .*/,'') < offerAnother.name.replace(/ .*/,'') ){
    return -1;
  }
  if ( offerOne.name.replace(/ .*/,'') > offerAnother.name.replace(/ .*/,'') ){
    return 1;
  }
  return 0;
}

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}
var offersListBlock = document.getElementById("offers-list");

const searchInputHandler = function(e) {

  let offerLinks = document.getElementsByClassName('offer-item-link');

  for (let x = 0; x < offerLinks.length; x++) {
    let oneOfferLink = offerLinks[x];
    let content = oneOfferLink.innerHTML.trim();

    if (!content.toLowerCase().includes(e.target.value.toLowerCase())) {
      oneOfferLink.parentElement.style.display = 'none';
    } else {
      oneOfferLink.parentElement.style.display = 'block';
    }
  }
}

const buttonClearHandler = function(e) {
  chrome.storage.local.remove("offersFound");
  chrome.action.setBadgeText({text:''});

  let offerLinks = document.getElementsByClassName('offer-item');

  while(offerLinks.length > 0){
    offerLinks[0].parentNode.removeChild(offerLinks[0]);
  }

  offersListBlock.innerText = "Очищено! Поищем что-нибудь еще.";
}

const source = document.getElementById('offer-search');
source.addEventListener('input', searchInputHandler);

const clearButton = document.getElementById('offers-clear');
clearButton.addEventListener('click', buttonClearHandler);

chrome.storage.local.get("offersFound", ( offers ) => {

  if(!offers || !offers.offersFound || !offers.offersFound.length) return;

  offersListBlock.innerHTML = '';

  offers.offersFound.sort(compareOfferPrice);
  offers.offersFound.sort(compareName);

  var currentCategory = '';

  offers.offersFound.forEach((offerItem) => {
    console.log(offerItem);

    if(offerItem.name.replace(/ .*/,'') != currentCategory){
      offersListBlock.appendChild(document.createElement('br'));
      currentCategory = offerItem.name.replace(/ .*/,'');
    }

    offersListBlock.appendChild( composeOfferLink(offerItem) );
  });
});

function composeOfferLink(offer) {

  var offerLine = document.createElement('div');
  var offerLink = document.createElement('a');

  var offerText = document.createTextNode(offer.name);
  var offerPrice = document.createTextNode(' - ' + offer.price + ' руб');

  offerLink.appendChild(offerText);

  offerLink.setAttribute('href', offer.url);
  offerLink.setAttribute('target', '_blank');
  offerLink.setAttribute('class', 'offer-item-link');
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

// chrome.action.setBadgeText({text: "10+"});

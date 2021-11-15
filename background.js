//Define globals
let stores;
let config;
let offersLookupEndpoint = 'https://cityads.com/api/rest/webmaster/json/goods?remote_auth=222ead1eaf0a837337d663052e309302&limit=5&keyword=';
let offerPropertiesToKeep = ['id', 'category', 'name', 'price','url','similarGoods'];

//Load configuration
fetch('config/stores.json')
    .then(response => response.json())
    .then(
        data => {
          console.log(data);
          stores = data;
        }
    )
    .catch(error => console.log(error));

fetch('config/config.json')
    .then(response => response.json())
    .then(
        data => {
          console.log(data);
          config = data;
        }
    )
    .catch(error => console.log(error));


//Parse tab titles, lookup for offers, keep found in storage
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if(changeInfo.title != undefined){
        console.log("Got title: " + changeInfo.title);

        stores.forEach(element => {
            let found = changeInfo.title.match(element.product_title_reg);

            if (found != null && found.length > 0) {
                console.log(found[0]);

                let goodTitle = found[0].replaceAll(/\w*\d\w*/g, "").replaceAll(/[()]/g, '').trim();

                console.log(goodTitle);
                let offersFound = { mainOffer : [], similarOffers : []};

                requestOffers(offersLookupEndpoint + goodTitle)
                    .then(data => {
                        console.log(data.data.items)

                        offersFound.mainOffer = fillOutOfferData(data, config.maxOffersPerRequest);

                        offersFound.mainOffer.forEach(oneOffer => {
                            requestOffers( prosectCityLink(oneOffer.similarGoods) ).then(data => {
                                offersFound.similarOffers = fillOutOfferData(data, config.maxOffersPerRequest);
                                chrome.storage.local.set({offersFound: offersFound});

                                chrome.action.setBadgeText({text: (offersFound.mainOffer.length + offersFound.similarOffers.length).toString()});
                            });
                        })
                    });
            }
        });
    }
});

async function requestOffers(url = '') {
    console.log("Getting data from " + url);

    const response = await fetch(url, {
        method: 'GET',
    });
    return response.json();
}

function fillOutOfferData(data, maxOffersCount) {

    let offersFilled = [];
    let offerCount = 0;

    for (let offerID of Object.keys(data.data.items)) {
        console.log(offerID + " -> " + data.data.items[offerID].name + ", " + data.data.items[offerID].price + "руб");

        let currentOne = {};

        Object.keys(data.data.items[offerID]).forEach((key) => {
            if (offerPropertiesToKeep.includes(key)) {
                currentOne[key] = data.data.items[offerID][key];
            }
        })

        if (offersFilled.findIndex(x => x.id === currentOne.id) == -1) {
            offersFilled.push(currentOne);
            if (++offerCount >= maxOffersCount) break;
        }
    }

    return offersFilled;
}

function setStorageAndBadge(offersFound) {
    chrome.storage.local.set({offersFound: offersFound});
    chrome.action.setBadgeText({text: offersFound.length.toString()});
}

function prosectCityLink(url){
    urlResponceTypeChanged = url.replace('xml', 'json');
    urlProtocolAdded = 'https:' + urlResponceTypeChanged;

    return urlProtocolAdded;
}
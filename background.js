//Define globals
let stores;
let offersLookupEndpoint = 'https://cityads.com/api/rest/webmaster/json/goods?remote_auth=222ead1eaf0a837337d663052e309302&limit=5&keyword=';
let offerPropertiesToKeep = ['id', 'category', 'name', 'price','url'];

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

//Parse tab titles, lookup for offers, keep found in storage
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if(changeInfo.title != undefined){
        console.log("Got title: " + changeInfo.title);

        stores.forEach(element => {
            let found = changeInfo.title.match(element.product_title_reg);

            if(found != null && found.length > 0) {
                console.log(found[0]);

                goodTitle = found[0].replaceAll(/\w*\d\w*/g, "").replaceAll(/[()]/g,'').trim();

                console.log(goodTitle);

                lookUpOffer(offersLookupEndpoint + goodTitle, { answer: 42 })
                    .then(data => {
                        console.log(data.data.items)

                        var offersFound = [];
                        chrome.storage.local.get('offersFound', (offers) => {
                            if(offers.offersFound !=undefined){
                                offersFound = offers.offersFound;
                            }

                            for (var offerID of Object.keys(data.data.items)) {
                                console.log(offerID + " -> " + data.data.items[offerID].name + ", " +  data.data.items[offerID].price + "руб");

                                let currentOne = {};

                                Object.keys(data.data.items[offerID]).forEach((key) => {
                                    if(offerPropertiesToKeep.includes(key)) {
                                        currentOne[key] = data.data.items[offerID][key];
                                    }
                                })

                                if (offersFound.findIndex(x => x.id === currentOne.id) == -1) {
                                    offersFound.push(currentOne);
                                }
                            }

                            chrome.storage.local.set({ offersFound: offersFound });

                            chrome.action.setBadgeText({text: offersFound.length.toString()});
                        });
                    });
            }
        });
    }
});

async function lookUpOffer(url = '', data = {}) {
    console.log("Getting data from " + url);

    const response = await fetch(url, {
        method: 'GET',
    });
    return response.json();
}
bfd.scrape_and_store_meals = function(callback){
    // Scrapes the users printable diary to get meal data for the past year. 
    //
    // The method in which we do this is a bit clunky, but the best with what 
    // we are given. 
    //
    // 1. Open an iframe in background.html which points to the users printable
    // diary, combined with a dummy get parameter ?load we can load in a specific 
    // content script (js/cs/load_printable_diary.js).
    //
    // 2. The content script sets the pages form to get a years worth of data 
    // (it defaults to displaying a days worth) and then submits it. 
    // It has also changed the action of the form so that the dummy get is now
    // ?send, which loads a different content script (js/cs/send_printable_diary.js).
    //
    // 3. The send content script now actually scrapes the meal data and using 
    // message passing sends this to the extension.
    //
    // Another thing to note is that because we are using these dummy gets, 
    // the default page behaviour wont change for the user, they can still use
    // reports/printable_diary just as usual.

    var $iframe = $('<iframe id="printable_diary_iframe" src="http://www.myfitnesspal.com/reports/printable_diary/?load"></iframe>');

    chrome.extension.onMessage.addListener(
        function(message, sender, sendResponse){
            var scraped_meals = message.scraped_meals;

            if(scraped_meals){
                scraped_meals = JSON.parse(scraped_meals);
                bfd.meals_store.append(scraped_meals);
            } else if(!message.not_logged_in){
                // Recieved a message we don't care about, don't want to do 
                // cleanup just yet.
                return;
            }

            chrome.extension.onMessage.removeListener(this);
            $iframe.remove();
            callback(scraped_meals);
        }
    );

    $('body').append($iframe);

}


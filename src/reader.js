import {
  createSolidDataset,
  createThing,
  setThing,
  addUrl,
  addStringNoLocale,
  saveSolidDatasetAt,
  getSolidDataset,
  getThingAll,
  getStringNoLocale,
  FetchError
} from "@inrupt/solid-client";

import {
 login,
 handleIncomingRedirect,
 getDefaultSession,
 fetch
} from "@inrupt/solid-client-authn-browser";

import { SCHEMA_INRUPT, RDF, AS } from "@inrupt/vocab-common-rdf";

const btnReadMulti = document.querySelector("#btnReadMulti");

// 1a. Start Login Process. Call login() function.
function loginToInruptDotCom() {

  var queryString = window.location.search;
  var urlParams   = "";
  var podusername = "";

  try {
    urlParams   = new URLSearchParams(queryString);
    podusername = urlParams.get('podusername');
    if (podusername == null) {
      podusername = "?podusername=" + document.getElementById("Pod1Name").value;
    }
    else {
      podusername = "";
    }
  } catch (error) {
    podusername = "?podusername=" + document.getElementById("Pod1Name").value;
  }

  return login({
    oidcIssuer: "https://broker.pod.inrupt.com",
    redirectUrl: window.location.href + podusername,
    clientName: "GDS Pod POC"
  });

}

// 1b. Login Redirect. Call handleIncomingRedirect() function.
// When redirected after login, finish the process by retrieving session information.
async function handleRedirectAfterLogin() {

    await handleIncomingRedirect();
    const session = getDefaultSession();
    if (session.info.isLoggedIn) {

      // Get detail from URL
      var queryString = window.location.search;
      var urlParams = new URLSearchParams(queryString);
      var podusername = urlParams.get('podusername')
      
      document.getElementById("Pod1Name").value = podusername;

      window.alert("Session is logged in")
      readMultiData();
    }
}

// The example has the login redirect back to the index.html.
// This calls the function to process login information.
// If the function is called when not part of the login redirect, the function is a no-op.

handleRedirectAfterLogin();

// 3. Read the Data
async function readMultiData() {

  window.alert("Running readMultiData")

  var contentPodUrl1;
  var contentPodUrl2;
  var contentPodUrl3;

  contentPodUrl1 = "https://" + document.getElementById("Pod1Name").value + ".inrupt.net/gdsdata/personal";
  contentPodUrl2 = "https://" + document.getElementById("Pod1Name").value + ".inrupt.net/gdsdata/passport";
  contentPodUrl3 = "https://" + document.getElementById("Pod1Name").value + ".inrupt.net/gdsdata/dbs";
  
  readDataItem(contentPodUrl1 + '/' + 'id', 'OutputID');
  readDataItem(contentPodUrl1 + '/' + 'dob', 'OutputDOB');
  readDataItem(contentPodUrl1 + '/' + 'address', 'OutputAddress');
  readDataItem(contentPodUrl2 + '/' + 'passportno', 'OutputPassportNo');
  readDataItem(contentPodUrl3 + '/' + 'docid', 'OutputDBSDocId');
  readDataItem(contentPodUrl3 + '/' + 'docstatus', 'OutputDBSStatus');
 
}

async function readDataItem(contentitem, contentdisplay) {

  // Read SolidDataset 
  var myData;
  var contentData = "";
  var contentStatus = document.querySelector("#Label" + contentdisplay);

  contentStatus.textContent = "";

  try {
    myData = await getSolidDataset(
      `${contentitem}`,
      { fetch: fetch }
    );

    let items = getThingAll(myData);

    for (let i = 0; i < items.length; i++) {
      let item = getStringNoLocale(items[i], SCHEMA_INRUPT.name);
      if (item != null) {
        contentData += item + "\n";
      }
    }
    
    contentStatus.textContent = contentData;

  } catch (error) {

    if (error instanceof FetchError) {

        if (error.statusCode === 401 || error.statusCode === 403) {
          console.error(error.message);
          contentStatus.textContent = "You are not authorised to access this data";
        }
        else if (error.statusCode === 404) {
          console.error(error.message);
          contentStatus.textContent = "Data does not exist";
        }
        else {
          console.error(error.message);
          contentStatus.textContent = "";
        }
    }
  }
}


btnReadMulti.onclick = function() {  
  loginToInruptDotCom();
};

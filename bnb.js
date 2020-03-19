function getParams(params) {
    let method = params.method;
    let depDate = params.depDate ?  params.depDate : 08;
    let depositGuest = params.depositGuest ?  params.depositGuest : 10;
    let depositHost = params.depositHost ?  params.depositHost : 10;
    let price = params.price ?  params.price : 30;
    let startDate = params.startDate ?  params.startDate : 01;
    let nuki = params.nuki ?  params.nuki : 0440;
    let interType = params.interType ?  params.interType : "False";
    let mark = params.mark ? params.mark : 1;
   
    return `{"prim":"Pair","args":[ {"prim":"Pair","args":[ {"prim":"Pair","args":[{"prim":"Pair","args":[{"prim":"Pair","args":[     {"prim":"Pair","args":[{"prim":"Pair","args":[{"prim":"Pair","args":[{"prim":"Pair","args":[{"prim":"Pair","args":[{"prim":"Pair","args":[{"prim":"Pair","args":[{"prim":"Pair","args":[{"prim":"False"},{"int":"1"}]},{"string":"tz1RBkXZSiQb3fS7Sg3zbFdPMBFPJUNHdcFo"}]},{"int":"0"}]},{"string":"${depDate}"}]},{"int":"${depositGuest}"}]},{"int":"${depositHost}"}]},{"int":"${mark}"}]},{"string":"${method}"}]},{"prim":"Pair","args":[{"string":"${nuki}"},{"prim":"${interType}"}]}]},{"string":"tz1cjpubPzgzeFbLo45hwHxMiuKqVNuhYeSc"}]},{"int":"${price}"}]},{"string":"${startDate}"}] },{"string":"tz1RT1L2WjS8U6X1ryGiTtVvGS1t1kGxgckF"}]}`;
}

const contractAddress = 'KT1UfGTASaRGu5jZZ5ZN4XXqaiofrAWzzre5';
const tezosNode = 'https://tezos-dev.cryptonomic-infra.tech:443';
const paramFormat = conseiljs.TezosParameterFormat.Micheline;
const conseilServer = {
    url: 'https://conseil-dev.cryptonomic-infra.tech:443',
    apiKey: '8ed0e93a-9dce-4a72-9aa9-26cb69d111fb',
    network: 'babylonnet'
}
const networkBlockTime = 30 + 1;
const secretKey = 'edskRcdzHcoHFpjDZwdmbi44SBL1Wob8RHWfC1V3MZ25d1sJgBzvECUPnAXjddBTyp2BKF4hQfm6PKu5nMKdMefocfP6MdKMmu';
let keyStore = {};
const alphanetFaucetAccount = {
    "mnemonic": ["push", "annual", "teach", "unique", "paddle", "sense", "pig", "scorpion", "day", "afraid", "regular", "judge", "steak", "taste", "wedding"],
    "secret": "429142151962c54856a39bf3575d3c9491d266d2",
    "amount": "28764214107",
    "pkh": "tz1ZSbwe9uqxU9RjUEas6WwmmfzFweudDbAC",
    "password": "diTFNeYP1V",
    "email": "ceemzqmt.ujxiqcmb@tezos.example.org"
};

function clearRPCOperationGroupHash(hash) {
    return hash.replace(/\"/g, '').replace(/\n/, '');
}

async function initAccount() {
    keyStore = await conseiljs.TezosWalletUtil.restoreIdentityWithSecretKey(secretKey);
}

async function makeRequest(params) {
    log('Sending...')
    $(".overly-loader").show()

    try {
        await initAccount();
        let nodeResult = await nodeActivation(params);
        let groupid = clearRPCOperationGroupHash(nodeResult.operationGroupID);
        let conseilResult = await OperationConfirmation(groupid);
        log('Activation has been accepted, operation ID : ' + groupid);
        
        if (conseilResult.length == 1 && conseilResult[0]['status'] !== 'applied') {
            nodeResult = await conseiljs.TezosNodeReader.getBlock(tezosNode, conseilResult[0]['block_hash']);
            $(".overly-loader").hide()
            return false;
        }
        
        if (conseilResult.length == 1 && conseilResult[0]['status'] === 'applied') {
            conseilResult = await conseiljs.TezosConseilClient.getAccount(conseilServer, conseilServer.network, contractAddress);
            log('Request has been saved')
        }
        $(".overly-loader").hide()
    } catch (error) {
        alertBox('Something went wrong please try again: details: '+error)
        $(".overly-loader").hide()
    }
   
    return true
}

//  Button action
$(function () {
    // owner actions 
    $("#owner .contract-init").on('click', async function () {
        // Clear alerbox
        clearAlertBox()

        let price = $(".step-one .price", "#owner").val();
        let depositHost = $(".step-one .depositHost", "#owner").val();
        let depositGuest = $(".step-one .depositGuest", "#owner").val();
        let start_date = $(".step-one .start_date", "#owner").val();
        let dep_date = $(".step-one .dep_date", "#owner").val();
        let nuki = $(".step-one .nuki", "#owner").val();
        
        // Check if required values has been submited
        if(!price || !depositHost || ! depositGuest || !start_date || !dep_date || !nuki){
            alertBox('All fields are required')
            return
        }
        
        if(parseFloat(price) == "NaN"){
          alertBox('Price must be a number')
            return false;
        }
        
         if(parseFloat(depositHost) == "NaN"){
          alertBox('Deposit host must be a number')
            return false;
        }
        
        if(parseFloat(depositGuest) == "NaN"){
          alertBox('Deposit guest must be a number')
            return false;
        }
        
        if(parseFloat(start_date) == "NaN" || parseFloat(dep_date) == "NaN"){
          alertBox('Start and departue date must be a number')
            return false;
        }
        
        // defined params on the getparams must be submitted here otherwise you will get error
        let params = { 'method': 'Contract_Initialisation',
                'price': price,
                        'depositGuest': depositGuest,
                        'depositHost': depositHost,
                        'startDate': start_date,
                        'depDate': dep_date,
                        'nuki': nuki
             }

        // The makerequest must return true if everything is good otherwise it must return false      
        let request = await makeRequest(params);
        if ( request ) {
            // Hide all steps and show the next one
            $("#owner .step").hide();
            $("#owner .step-two").show();

            // Disabled all buttons and enable the next one
            $("#owner .btn").prop('disabled', true);
            $("#owner .send-deposit-owner").prop('disabled', false);
        }
    });

    $("#owner .send-deposit-owner").on('click', async function () {
        // Clear alerbox
        clearAlertBox()

        let depositHost = $(".step-two .deposit", "#owner").val();

        // Check if required values has been submited
        if(parseFloat(depositHost) == "NaN"){
            alertBox('Deposit must be a number')
            return false;
        }

         // defined params on the getparams must be submitted here otherwise you will get error
        let params = { 
            'method': 'SendDepositOwner',
                'depositHost': depositHost
        }

        // The makerequest must return true if everything is good otherwise it must return false  
        let request = await makeRequest(params);
        if ( request ) {
            // Hide all steps and show the next one
            $("#owner .step-two").hide();
            $("#owner .step-three").show();

            // Disabled all buttons and enable the next one
            $("#owner .btn").prop('disabled', true);
            $("#owner .finish-contract-owner").prop('disabled', false);
        }
        
    });

    $("#owner .finish-contract-owner").on('click', async function () {

        // Clear alerbox
        clearAlertBox()

        let mark = $(".step-two .finish-owner", "#owner").val();

        // Check if required values has been submited
        if(parseFloat(mark) == "NaN"){
            alertBox('Deposit must be a number')
            return false;
        }

         // defined params on the getparams must be submitted here otherwise you will get error
        let params = { 
            'method': 'Finish_ContractOwner',
                'mark': mark
        }

        // The makerequest must return true if everything is good otherwise it must return false  
        let request = await makeRequest(params);
        if ( request ) {
            // Hide all steps and show the next one
            $("#owner .step").hide();
            $("#owner .step-two").show();

            // Disabled all buttons and enable the next one
            $("#owner .btn").prop('disabled', true);
            $("#owner .send-deposit-owner").prop('disabled', false);
        }
    });

    $("#owner .cancellation").on('click', async function () {
        log('cancel..')
        alertBox('You clicked tha owner cancel button')
    });

    // visitor actions 
    

    $("#visitor .sendPrice").on('click', async function () {
        // Clear alerbox
        clearAlertBox()

        let price = $(".step-one .price", "#visitor").val();

        // Check if required values has been submited
        if(parseFloat(price) == "NaN"){
            alertBox('Price must be a number')
            return false;
        }

         // defined params on the getparams must be submitted here otherwise you will get error
        let params = { 
            'method': 'SendPrice',
                'price': price
        }

        // The makerequest must return true if everything is good otherwise it must return false  
        let request = await makeRequest(params);
        if ( request ) {
            // Hide all steps and show the next one
            $("#visitor .step").hide();
            $("#visitor .step-two").show();

            // Disabled all buttons and enable the next one
            $("#visitor .btn").prop('disabled', true);
            $("#visitor .sendDepositVisitor").prop('disabled', false);
        }
        
    });
    $("#visitor .sendDepositVisitor").on('click', async function () {
        // Clear alerbox
        clearAlertBox()

        let depositGuest = $(".step-two .depositGuest", "#visitor").val();

        // Check if required values has been submited
        if(parseFloat(depositGuest) == "NaN"){
            alertBox('depositGuest must be a number')
            return false;
        }

         // defined params on the getparams must be submitted here otherwise you will get error
        let params = { 
            'method': 'SendDepositVisitor',
                'depositGuest': depositGuest
        }

        // The makerequest must return true if everything is good otherwise it must return false  
        let request = await makeRequest(params);
        if ( request ) {
            // Hide all steps and show the next one
            $("#visitor .step").hide();
            $("#visitor .step-three").show();

            // Disabled all buttons and enable the next one
            $("#visitor .btn").prop('disabled', true);
            $("#visitor .Issues").prop('disabled', false);
        }
        
    });
    
    
    $("#visitor .Issues").on('click', async function () {
        // Clear alerbox
        clearAlertBox()

        let noElec = $(".step-three .noElec", "#visitor").prop("checked");
        let noWater = $(".step-three .noWater", "#visitor").prop("checked");
        issuesit = $("theresIssues").prop("checked");
        // Check if required values has been submited
        if(issuesit){
            if(chkbox1 == false && chkbox2 == false){
                alertBox('you must select an issue')
                return false;
            }
        }

         // defined params on the getparams must be submitted here otherwise you will get error
        let params = { 
            'method': 'Issues',
                'noElec': noElec,
                'noWater': noWater
        }

        // The makerequest must return true if everything is good otherwise it must return false  
        let request = await makeRequest(params);
        if ( request ) {
            // Hide all steps and show the next one
            $("#visitor .step").hide();
            $("#visitor .step-four").show();

            // Disabled all buttons and enable the next one
            $("#visitor .btn").prop('disabled', true);
            $("#visitor .FinishContractVisitor").prop('disabled', false);
        }
        
    });

    $("#visitor .FinishContractVisitor").on('click', async function () {

        // Clear alerbox
        clearAlertBox()

        let mark = $(".step-thee .finish-guest", "#visitor").val();

        // Check if required values has been submited
        if(parseFloat(mark) == "NaN"){
            alertBox('mark must be a number')
            return false;
        }

         // defined params on the getparams must be submitted here otherwise you will get error
        let params = { 
            'method': 'Finish_ContractVisitor',
                'mark': mark
        }

        // The makerequest must return true if everything is good otherwise it must return false  
        let request = await makeRequest(params);
        if ( request ) {
            // Hide all steps and show the next one
            $("#owner .step").hide();
            $("#owner .step-two").show();

            // Disabled all buttons and enable the next one
            $("#owner .btn").prop('disabled', true);
            $("#owner .send-deposit-owner").prop('disabled', false);
        }
    });
});

async function nodeActivation(params){
  let result = await conseiljs.TezosNodeWriter.sendContractInvocationOperation(tezosNode, keyStore, contractAddress, 0, 100000, '', 20000, 500000, undefined, getParams(params), paramFormat);
  return result;
}

async function OperationConfirmation(groupid){
  let result = await conseiljs.TezosConseilClient.awaitOperationConfirmation(conseilServer, conseilServer.network, groupid, 10, networkBlockTime);
  return result;
}

// Helpers 
// Alert box takes 2 params msg: text you want to display, type the alert type it must be (danger | warning | success | info)
function alertBox(msg, type) {
    if (!type) type = 'danger'
    $(".alert").addClass("alert-" + type).html(msg);
}

// show debug info
function log(msg) {
    if(!msg) return
    $(".debug").append("<div>"+msg+"</div>");
}

function clearAlertBox() {
    let ab = $(".alert");
    ab.html('');
    ab.removeClass();
    ab.addClass("alert");
}
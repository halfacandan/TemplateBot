module.exports = {
    ExampleApiCall: async function (botCommandPrefix){
        const endpointPath = `v1/hawx?commandPrefix=${encodeURIComponent(botCommandPrefix)}`;
        let json = await MakeApiGetCallAsync(endpointPath);
        return json;
    },
    ExampleApiCallWithAuth: async function (jwtToken){
        const endpointPath = "v1/guild/honour/daily";
        let json = await MakeApiGetCallAsync(endpointPath, jwtToken);
        return json;
    }
}

const request = require('request');

function MakeApiGetCallAsync(endpointPath, jwtToken = null) {

    const apiEndpoint = new URL(endpointPath, process.env.API_ENDPOINT_BASE).href;
    console.log("GET:" + apiEndpoint);

    const options = {
        url: apiEndpoint,
        json: true,
        headers: {
            'Content-Type': 'application/json',
            'Jwt-Auth': jwtToken
        }
      };

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (error) reject(error);
            if (response.statusCode != 200) {
                reject(null);
            }
            resolve(body);
        });
    }).catch((reason) => {
        console.log(`The promise was rejected because (${reason})`);
    });
}

function MakeApiPostCallAsync(endpointPath, jwtToken = null, postData = null) {

    const apiEndpoint = new URL(endpointPath, process.env.API_ENDPOINT_BASE).href;
    console.log("POST:" + apiEndpoint);

    const options = {
        url: apiEndpoint,
        method :"POST",
        followAllRedirects: true,
        body: postData,
        json: true,
        headers: {
            'Content-Type': 'application/json',
            'Jwt-Auth': jwtToken,
            'Content-Length': postData.length
        }
      };

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (error) reject(error);
            if (response.statusCode != 200) {
                reject(null);
            }
            resolve(body);
        });
    }).catch((reason) => {
        console.log(`The promise was rejected because (${reason})`);
    });
}
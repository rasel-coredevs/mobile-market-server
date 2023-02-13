const axios = require("axios");

class Bkash {
    constructor(username, password, appKey, appSecret) {
        // Credentials
        this.username = username;
        this.password = password;
        this.appKey = appKey;
        this.appSecret = appSecret;

        // Static Properties
        this.__baseurl = "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/";
        this.__grantToken = "token/grant";
        this.__refreshToken = "token/refresh";
        this.__create = "create";
        this.__execute = "execute";
        this.__statusOfAgreement = "agreement/status";
        this.__cancelAgreement = "agreement/cancel";
        this.__queryPayment = "payment/status";
        this.__queryTransaction = "general/searchTransaction";
        this.__refund = "payment/refund";


        //payerInfo
        this.amount=undefined;
        this.payerReference=undefined;
    }

    /**
     * Request/Response Handler
     * 
     * @param {String} endpoint 
     * @param {Object} payload 
     * @param {Object} headers 
     * @returns Object Response Data from bKash api
     */
    async makeRequest(endpoint, payload, headers) {
        if (!headers) {
            headers = {
                "content-type": "application/json",
                "Authorization": this.id_token || "",
                "x-app-key": this.appKey
            };
        }

        try {
            const { data } = await axios(this.__baseurl + endpoint, {
                method: "POST",
                headers,
                data: payload
            });

           /*  if (data.statusCode !== "0000") {
                throw new Error(data.statusMessage);
            } */

            return data;
        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * generate id_token and refresh_token
     * @returns Object Token object
     */
    async grantToken() {
        let payload = {
            "app_key": this.appKey,
            "app_secret": this.appSecret
        };

        let headers = {
            "username": this.username,
            "password": this.password
        };

        try {
            const data = await this.makeRequest(this.__grantToken, payload, headers);
            this.id_token = data["id_token"];
            this.refresh_token = data["refresh_token"];
            return data;
        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * get new id_token and refresh_token
     * @returns Object new Token object
     */
    async refreshToken(){
        let payload = {
            "app_key": this.appKey,
            "app_secret": this.appSecret,
            "refresh_token":this.refresh_token,
        };

        let headers = {
            "username": this.username,
            "password": this.password
        };

        try {
            const data = await this.makeRequest(this.__refreshToken, payload, headers);
            this.id_token = data["id_token"];
            this.refresh_token = data["refresh_token"];
            return data;
        } catch (err) {
            throw new Error(err);
        }
    }

    async setPayerInfo(amount,payerReference){
        this.amount = amount;
        this.payerReference = payerReference;
        return ;
    }

    /**
     * Creates a new Agreement
     * @param {String} paymentID 
     * @returns Object Agreement Object
     */
    async createAgreement(payload) {
        try {
            payload.mode = "0000";
            payload.currency = "BDT";
            payload.intent = "Sale";
            payload.amount=this.amount;
            payload.payerReference=this.payerReference;
            
            //console.log(payload);
            if(!payload.callbackURL) payload.callbackURL = "http://localhost:5000/executeagreement";
            return await this.makeRequest(this.__create, payload);
        } catch (err) {
            throw new Error(err)
        }
    }

    /**
     * Execute an Agreement
     * @param {string} paymentID 
     * @returns Object Execute Information object
     */
    async executeAgrement(paymentID) {
        return new Promise((resolve, reject) => {
            this.makeRequest(this.__execute, { paymentID })
                .then(res => resolve(res))
                .catch(err => reject(err));
        });
    }

    /**
     * Query Status of an Agreement
     * @param {string} agreementID 
     * @returns Object Query Agreement object
     */
    async queryAgreement(agreementID){
        return new Promise((resolve,reject)=>{
            this.makeRequest(this.__statusOfAgreement,{agreementID})
                .then(res=>resolve(res))
                .catch(err=>reject(err))
        });
    }

    /**
     * Cancel an Agreement
     * @param {string} agreementID 
     * @returns Object Agreement Cancel object
     */
    async cancelAgreement(agreementID){
        return new Promise((resolve,reject)=>{
            this.makeRequest(this.__cancelAgreement,{agreementID})
                .then(res=>resolve(res))
                .catch(err=>reject(err))
        })
    }

    /**
     * Create a Payment
     * @param {object} payload 
     * @returns Object Create Payment object
     */
    async createPayment(payload){
        payload.mode = "0001";
        payload.currency = "BDT";
        payload.intent= "sale";
        payload.amount = this.amount;
        payload.payerReference = this.payerReference;
        payload.merchantInvoiceNumber = "kdfdkfkf"
        if(!payload.callbackURL) payload.callbackURL = "http://localhost:5000/executepayment";
        return new Promise((resolve,reject)=>{
            this.makeRequest(this.__create,payload)
                .then(res=>resolve(res))
                .catch(err=>reject(err))
        })
    }

    /**
     * Execute a Payment
     * @param {string} paymentID 
     * @returns Object Execute Payment object
     */
    executePayment(paymentID){
        return new Promise((resolve,reject)=>{
            this.makeRequest(this.__execute,{paymentID})
                .then(res=>resolve(res))
                .catch(err=>reject(err))
        })
    }
    
    /**
     * Query of a Payment
     * @param {string} paymentID 
     * @returns Object Query Status object
     */
    queryPayment(paymentID){
        return new Promise((resolve,reject)=>{
            this.makeRequest(this.__queryPayment,{paymentID})
                .then(res=>resolve(res))
                .catch(err=>reject(err))
        })
    }

    /**
     * Query of a Transaction
     * @param {string} trxID 
     * @returns Object Query of a Transaction object
     */
    searchTransaction(trxID){
        return new Promise((resolve,reject)=>{
            this.makeRequest(this.__queryTransaction,{trxID})
                .then(res=>resolve(res))
                .catch(err=>reject(err))
        })
    }

    /**
     * Refund a Transaction
     * @param {object} payload 
     * @returns Object Refund Transaction object
     */
    refundTransaction(payload){
        return new Promise((resolve,reject)=>{
            this.makeRequest(this.__refund,payload)
                .then(res=>resolve(res))
                .catch(err=>reject(err))
        })
    }

    /**
     * Query of a Refund Transaction
     * @param {object} payload 
     * @returns Object Refund Status Object
     */
    refundStatus(payload){
        return new Promise((resolve,reject)=>{
            this.makeRequest(this.__refund,payload)
                .then(res=>resolve(res))
                .catch(err=>reject(err))
        })
    }
}

module.exports = Bkash;
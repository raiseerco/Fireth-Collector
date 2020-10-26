/* 
        🔥 Fireth Gas Collector
        🕶 (C) 2020 EthSagan. All rights reserved.
*/

var config = require("./config")();
const PROV_GASNOW = config.PROV_GASNOW;
const PROV_ETHERCHAIN = config.PROV_ETHERCHAIN;
const PROV_ETHGASSTATION = config.PROV_ETHGASSTATION;
const PROV_ETHPRICE = config.PROV_ETHPRICE;
const INTERVALMS = config.INTERVALMS;
const uriDB = config.uriDB;
const d3 = require("d3");
const axios = require('axios');
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(uriDB, { useNewUrlParser: true, useUnifiedTopology: true });

var counter = 0;
var arrMediciones = [];

// var collectionGN;
// var collectionEG;
// var collectionEC;

console.log('🔥 Welcome to Fireth Collector');

client.connect(erro => {
    collectionBarGN = client.db("fireth").collection("barGN");
    collectionBarEG = client.db("fireth").collection("barEG");
    collectionBarEC = client.db("fireth").collection("barEC");
    collectionBarETH = client.db("fireth").collection("barETH");


    // collectionGN = client.db("fireth").collection("gasGN");
    // collectionEG = client.db("fireth").collection("gasEG");
    // collectionEC = client.db("fireth").collection("gasEC");

    console.log('✅ 0 connected to database.');
    console.log(ahora() + " Iniciando interval...");
    //getFromMongo();
    setInterval(collectData, INTERVALMS); // cada 20 segundos recolecta y graba // cada 6 rounds graba una barra -> barra de 2 min
})

function collectData() {
    console.log("   " + ahora() + " ➡️ Lanzando promesas, round: " + counter + " started.");
    counter++;
    let dataGN = {};
    let dataEG = {};
    let dataEC = {};
    let dateNow =  Date.now();
    var promises = [];
    promises.push(axios.get(PROV_ETHERCHAIN).then(resEtherchain => {
        console.log("      ✅ 1 got etherchain ok.");
        dataEC.datetime = dateNow; // Math.floor(Date.now() / 1000);
        dataEC.fastest = resEtherchain.data.fastest;
        dataEC.fast = resEtherchain.data.fast;
        dataEC.standard = resEtherchain.data.standard;
        dataEC.safe = resEtherchain.data.safeLow;
    }));

    promises.push(axios.get(PROV_ETHGASSTATION).then(resEthgas => {
        console.log("      ✅ 2 got ethgasstation ok.");
        dataEG.datetime = dateNow; // Math.floor(Date.now() / 1000);
        dataEG.fastest = resEthgas.data.fastest / 10;
        dataEG.fast = resEthgas.data.fast / 10;
        dataEG.standard = resEthgas.data.average / 10;
        dataEG.safe = resEthgas.data.safeLow / 10;
    }));

    promises.push(axios.get(PROV_GASNOW).then(resGasnow => {
        console.log("      ✅ 3 got gasnow ok.");
        dataGN.datetime = dateNow; // Math.floor(Date.now() / 1000);
        dataGN.fastest = resGasnow.data.data.rapid / 1000000000;
        dataGN.fast = resGasnow.data.data.fast / 1000000000;
        dataGN.standard = resGasnow.data.data.standard / 1000000000;
        dataGN.safe = resGasnow.data.data.slow / 1000000000;
    }));

    promises.push(axios.get(PROV_ETHPRICE).then(resEthprice => {
        dataEC.ethPrice = resEthprice.data.quotes.USD.price;
        dataEG.ethPrice = resEthprice.data.quotes.USD.price;
        dataGN.ethPrice = resEthprice.data.quotes.USD.price;
        console.log("      ✅ 4 got ethprice ok.");
    }));
    console.log("   " + ahora() + " ➡️ Promesas lanzadas, esperando resolucion...");

    Promise.all(promises).then(function () {
        console.log("      " + ahora() + " ✅ Promises got. Saving into array.");
        storeIntoArray(dataEC, dataEG, dataGN);
    }).catch(function (error) {
            console.log(error);
        });


    // axios.get(PROV_ETHERCHAIN).then(resEtherchain => {
    //     console.log("   ✅ 1 got etherchain ok.");
    //     dataEC.datetime = Date.now(); // Math.floor(Date.now() / 1000);
    //     dataEC.fastest = resEtherchain.data.fastest;
    //     dataEC.fast = resEtherchain.data.fast;
    //     dataEC.standard = resEtherchain.data.standard;
    //     dataEC.safe = resEtherchain.data.safeLow;
    //     axios.get(PROV_ETHGASSTATION).then(resEthgas => {
    //         console.log("   ✅ 2 got ethgasstation ok.");
    //         dataEG.datetime = Date.now(); // Math.floor(Date.now() / 1000);
    //         dataEG.fastest = resEthgas.data.fastest / 10;
    //         dataEG.fast = resEthgas.data.fast / 10;
    //         dataEG.standard = resEthgas.data.average / 10;
    //         dataEG.safe = resEthgas.data.safeLow / 10;
    //         axios.get(PROV_GASNOW).then(resGasnow => {
    //             console.log("   ✅ 3 got gasnow ok.");
    //             dataGN.datetime = Date.now(); // Math.floor(Date.now() / 1000);
    //             dataGN.fastest = resGasnow.data.data.rapid / 1000000000;
    //             dataGN.fast = resGasnow.data.data.fast / 1000000000;
    //             dataGN.standard = resGasnow.data.data.standard / 1000000000;
    //             dataGN.safe = resGasnow.data.data.slow / 1000000000;
    //             axios.get(PROV_ETHPRICE).then(resEthprice => {
    //                 dataEC.ethPrice = resEthprice.data.quotes.USD.price;
    //                 dataEG.ethPrice = resEthprice.data.quotes.USD.price;
    //                 dataGN.ethPrice = resEthprice.data.quotes.USD.price;
    //                 console.log("   ✅ 4 got ethprice ok.");

    //                 console.log("   ✅ all data is ok. Saving into array.");
    //                 storeIntoArray(dataGN,dataEC,dataEG);


    //                 try {
    //                     collectionGN.insertOne(dataGN, (err, res) => {
    //                         if (err) {
    //                             console.log("   5 error insertoneGN...");
    //                             //throw err
    //                         } else {
    //                             console.log("   ✅ 5 insert gn ok.");
    //                         }
    //                     });
    //                     collectionEC.insertOne(dataEC, (err, res) => {
    //                         if (err) {
    //                             console.log("   5 error insertoneEC...");
    //                             //throw err
    //                         } else {
    //                             console.log("   ✅ 5 insert ec ok.");
    //                         }
    //                     });
    //                     collectionEG.insertOne(dataEG, (err, res) => {
    //                         if (err) {
    //                             console.log("   5 error insertoneEG...");
    //                           //  throw err
    //                         } else {
    //                             console.log("   ✅ 5 insert eg ok.");
    //                         }
    //                     });
    //                 }
    //                 catch (error) {
    //                     console.log(error.message)
    //                 }
    //             }).catch(errEthprice => {
    //                 console.log(errEthprice.message)
    //             })
    //         }).catch(errGN => {
    //             console.log(errGN.message)
    //         });
    //     }).catch(errEG => {
    //         console.log(errEG.message)
    //     });
    // }).catch(errEC => {
    //     console.log(errEC.message)
    // })
}

function storeIntoArray(_ec, _eg, _gn) {
    let _medicion = {};
    _medicion.date=_ec.datetime;
    _medicion.ethPrice= _ec.ethPrice;
    _medicion.fastestEC = _ec.fastest;
    _medicion.fastEC = _ec.fast;
    _medicion.standardEC = _ec.standard;
    _medicion.safeEC = _ec.safe;
    _medicion.fastestEG = _eg.fastest;
    _medicion.fastEG = _eg.fast;
    _medicion.standardEG = _eg.standard;
    _medicion.safeEG = _eg.safe;
    _medicion.fastestGN = _gn.fastest;
    _medicion.fastGN = _gn.fast;
    _medicion.standardGN = _gn.standard;
    _medicion.safeGN = _gn.safe;
    arrMediciones.push(_medicion);
    if (arrMediciones.length>=6) buildOHLC();
}

function buildOHLC() {
    let barEC = {};
    let barEG = {};
    let barGN = {};
    let barETH = {};

    let allETH = arrMediciones.map(_o => _o.ethPrice);
    let allFastestEC = arrMediciones.map(_o => _o.fastestEC);
    let allFastestEG = arrMediciones.map(_o => _o.fastestEG);
    let allFastestGN = arrMediciones.map(_o => _o.fastestGN);
    let allFastEC = arrMediciones.map(_o => _o.fastEC);
    let allFastEG = arrMediciones.map(_o => _o.fastEG);
    let allFastGN = arrMediciones.map(_o => _o.fastGN);
    let allStandardEC = arrMediciones.map(_o => _o.standardEC);
    let allStandardEG = arrMediciones.map(_o => _o.standardEG);
    let allStandardGN = arrMediciones.map(_o => _o.standardGN);
    let allSafeEC = arrMediciones.map(_o => _o.safeEC);
    let allSafeEG = arrMediciones.map(_o => _o.safeEG);
    let allSafeGN = arrMediciones.map(_o => _o.safeGN);

    barETH.d= arrMediciones[0].date;
    barETH.O=allETH[0];
    barETH.H=d3.max(allETH);
    barETH.L=d3.min(allETH);
    barETH.C=allETH[allETH.length-1]

    barEC.d = arrMediciones[0].date;
    barEC.ftO=allFastestEC[0];
    barEC.ftH=d3.max(allFastestEC);
    barEC.ftL=d3.min(allFastestEC);
    barEC.ftC=allFastestEC[allFastestEC.length-1]
    barEC.fsO=allFastEC[0];
    barEC.fsH=d3.max(allFastEC);
    barEC.fsL=d3.min(allFastEC);
    barEC.fsC=allFastEC[allFastEC.length-1]
    barEC.stO=allStandardEC[0];
    barEC.stH=d3.max(allStandardEC);
    barEC.stL=d3.min(allStandardEC);
    barEC.stC=allStandardEC[allStandardEC.length-1]
    barEC.saO=allSafeEC[0];
    barEC.saH=d3.max(allSafeEC);
    barEC.saL=d3.min(allSafeEC);
    barEC.saC=allSafeEC[allSafeEC.length-1]

    barEG.d = arrMediciones[0].date;
    barEG.ftO=allFastestEG[0];
    barEG.ftH=d3.max(allFastestEG);
    barEG.ftL=d3.min(allFastestEG);
    barEG.ftC=allFastestEG[allFastestEG.length-1]
    barEG.fsO=allFastEG[0];
    barEG.fsH=d3.max(allFastEG);
    barEG.fsL=d3.min(allFastEG);
    barEG.fsC=allFastEG[allFastEG.length-1]
    barEG.stO=allStandardEG[0];
    barEG.stH=d3.max(allStandardEG);
    barEG.stL=d3.min(allStandardEG);
    barEG.stC=allStandardEG[allStandardEG.length-1]
    barEG.saO=allSafeEG[0];
    barEG.saH=d3.max(allSafeEG);
    barEG.saL=d3.min(allSafeEG);
    barEG.saC=allSafeEG[allSafeEG.length-1]

    barGN.d = arrMediciones[0].date;
    barGN.ftO=allFastestGN[0];
    barGN.ftH=d3.max(allFastestGN);
    barGN.ftL=d3.min(allFastestGN);
    barGN.ftC=allFastestGN[allFastestGN.length-1]
    barGN.fsO=allFastGN[0];
    barGN.fsH=d3.max(allFastGN);
    barGN.fsL=d3.min(allFastGN);
    barGN.fsC=allFastGN[allFastGN.length-1]
    barGN.stO=allStandardGN[0];
    barGN.stH=d3.max(allStandardGN);
    barGN.stL=d3.min(allStandardGN);
    barGN.stC=allStandardGN[allStandardGN.length-1]
    barGN.saO=allSafeGN[0];
    barGN.saH=d3.max(allSafeGN);
    barGN.saL=d3.min(allSafeGN);
    barGN.saC=allSafeGN[allSafeGN.length-1]
    //savedata barra 2 min
    try {
        collectionBarGN.insertOne(barGN, (err, res) => {
            if (err) {
                console.log("   5 error insertoneGN...");
                //throw err
            } else {
                console.log("   ✅ 5 insert gn ok.");
                barGN={};
            }
        });
        collectionBarEC.insertOne(barEC, (err, res) => {
            if (err) {
                console.log("   5 error insertoneEC...");
                //throw err
            } else {
                console.log("   ✅ 5 insert ec ok.");
                barEC={};
            }
        });
        collectionBarEG.insertOne(barEG, (err, res) => {
            if (err) {
                console.log("   5 error insertoneEG...");
                //  throw err
            } else {
                console.log("   ✅ 5 insert eg ok.");
                barEG={};
            }
        });
        collectionBarETH.insertOne(barETH, (err, res) => {
            if (err) {
                console.log("   5 error insertoneEG...");
                //  throw err
            } else {
                console.log("   ✅ 5 insert eg ok.");
                barETH={};
            }
        });
    }
    catch (error) {
        console.log(error.message)
    }
    counter=0;
    arrMediciones=[];
    console.log("Mediciones reseteadas.")
}

function ahora() {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return dateTime = date + ' ' + time;
}

function addM(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
}


//deprecated
function convertToOHLC(data) {
    try {
        let result = [];
        let arrFastest = [];
        let arrFast = [];
        let arrStandard = [];
        let arrSafe = [];
        let arrEth = [];
        data.sort((a, b) => d3.ascending(a.datetime, b.datetime));
        let format = d3.timeFormat("%Y-%m-%d %H:%M");
        data.forEach(d => d.datetime = format(new Date(d.datetime)));
        let allDates = [...new Set(data.map(d => d.datetime))];
        
        let i=0;
        console.log("--" + new Date() + " adentro del array ");
        allDates.forEach(d => {                             
            let tFastest = {};
            let filteredData = data.filter(e => e.datetime === d); //get data only from current day
            tFastest._d = Date.parse(d);
            tFastest.o = filteredData[0].fastest; //como los datos estan ordenados trae el primero obviamente
            tFastest.c = filteredData[filteredData.length - 1].fastest; //ultimo
            tFastest.h = d3.max(filteredData, e => e.fastest);
            tFastest.l = d3.min(filteredData, e => e.fastest);
            arrFastest.push(new Array(tFastest._d, tFastest.o, tFastest.c, tFastest.h, tFastest.l));

            let tFast = {};
            tFast._d = Date.parse(d);
            tFast.o = filteredData[0].fast;
            tFast.c = filteredData[filteredData.length - 1].fast;
            tFast.h = d3.max(filteredData, e => e.fast);
            tFast.l = d3.min(filteredData, e => e.fast);
            arrFast.push(new Array(tFast._d, tFast.o, tFast.c, tFast.h, tFast.l));

            let tStandard = {};
            tStandard._d = Date.parse(d);
            tStandard.o = filteredData[0].standard;
            tStandard.c = filteredData[filteredData.length - 1].standard;
            tStandard.h = d3.max(filteredData, e => e.standard);
            tStandard.l = d3.min(filteredData, e => e.standard);
            arrStandard.push(new Array(tStandard._d, tStandard.o, tStandard.c, tStandard.h, tStandard.l));

            let tSafe = {};
            tSafe._d = Date.parse(d);
            tSafe.o = filteredData[0].safe;
            tSafe.c = filteredData[filteredData.length - 1].safe;
            tSafe.h = d3.max(filteredData, e => e.safe);
            tSafe.l = d3.min(filteredData, e => e.safe);
            arrSafe.push(new Array(tSafe._d, tSafe.o, tSafe.c, tSafe.h, tSafe.l));

            let tEth = {};
            tEth._d = Date.parse(d);
            tEth.o = filteredData[0].ethPrice;
            tEth.c = filteredData[filteredData.length - 1].ethPrice;
            tEth.h = d3.max(filteredData, e => e.ethPrice);
            tEth.l = d3.min(filteredData, e => e.ethPrice);
            arrEth.push(new Array(tEth._d, tEth.o, tEth.c, tEth.h, tEth.l));
        });
        result = {
            "Eth": arrEth,
            "Fastest": arrFastest,
            "Fast": arrFast,
            "Standard": arrStandard,
            "Safe": arrSafe,
        }

        console.log("--" + new Date() + " fin.");
        return result;
    }
    catch (e) {
        console.log("*Error en convert: " + e.stack);
    }
};

//db migration from version anterior
function getFromMongo() { 
    var collection = client.db("fireth").collection("gasGN");
    try {
        var arrNuevoGN=[]
        collection.find({}).toArray(function (err, result) {
            console.log("adentro de collection...");
            var arrRow=[];
            var _a = new Date(result[0].datetime);
            var _stop = addM(_a,2);
            result.forEach(e => {
                //tomar mediciones de cada dos minutos y armar ohlc
                _actual =new Date(e.datetime);
                if (_actual<=_stop) {
                    //acumular ohlc, mando a array
                    let row ={}
                    row.datetime= e.datetime
                    row.fastest=e.fastest
                    row.fast=e.fast
                    row.standard=e.standard
                    row.safe=e.safe
                    arrRow.push(row)
                }                
                else {
                    //generar ohlc row
                    _stop = addM(_actual,2);
                    let iNuevo={}
                    if (arrRow[0]==null) {
                        let ssss=0;
                    }
                    else {
                        iNuevo.d=arrRow[0].datetime
                        iNuevo.ftO=arrRow[0].fastest; //ultimo
                        iNuevo.ftH=d3.max(arrRow, e => e.fastest); 
                        iNuevo.ftL=d3.min(arrRow, e => e.fastest); 
                        iNuevo.ftC=arrRow[arrRow.length - 1].fastest; //ultimo

                        iNuevo.fsO=arrRow[0].fast; //ultimo
                        iNuevo.fsH=d3.max(arrRow, e => e.fast); 
                        iNuevo.fsL=d3.min(arrRow, e => e.fast); 
                        iNuevo.fsC=arrRow[arrRow.length - 1].fast; //ultimo

                        iNuevo.stO=arrRow[0].standard; //ultimo
                        iNuevo.stH=d3.max(arrRow, e => e.standard); 
                        iNuevo.stL=d3.min(arrRow, e => e.standard); 
                        iNuevo.stC=arrRow[arrRow.length - 1].standard; //ultimo

                        iNuevo.saO=arrRow[0].safe; //ultimo
                        iNuevo.saH=d3.max(arrRow, e => e.safe); 
                        iNuevo.saL=d3.min(arrRow, e => e.safe); 
                        iNuevo.saC=arrRow[arrRow.length - 1].safe; //ultimo

                        arrNuevoGN.push(iNuevo)
                        arrRow=[];  
                    }
                }
            });
            collectionBarGN.insertMany(arrNuevoGN, (err, res) => {
                if (err) {
                    console.log("   5 error insertoneGN...");
                } else {
                    console.log("   ✅ 5 insert gn ok.");
                }
            });
        });

    }
    catch (e) {
        console.log(e.message)
    }


    collection = client.db("fireth").collection("gasEC");
    try {
        var arrNuevoEC=[]
        collection.find({}).toArray(function (err, result) {
            console.log("adentro de collection...");
            var arrRow=[];
            var _a = new Date(result[0].datetime);
            var _stop = addM(_a,2);
            result.forEach(e => {
                //tomar mediciones de cada dos minutos y armar ohlc
                _actual =new Date(e.datetime);
                if (_actual<=_stop) {
                    //acumular ohlc, mando a array
                    let row ={}
                    row.datetime= e.datetime
                    row.fastest=e.fastest
                    row.fast=e.fast
                    row.standard=e.standard
                    row.safe=e.safe
                    arrRow.push(row)
                }                
                else {
                    //generar ohlc row
                    _stop = addM(_actual,2);
                    let iNuevo={}
                    if (arrRow[0]==null) {
                        let ssss=0;
                    }
                    else {
                        iNuevo.d=arrRow[0].datetime
                        iNuevo.ftO=arrRow[0].fastest; //ultimo
                        iNuevo.ftH=d3.max(arrRow, e => e.fastest); 
                        iNuevo.ftL=d3.min(arrRow, e => e.fastest); 
                        iNuevo.ftC=arrRow[arrRow.length - 1].fastest; //ultimo

                        iNuevo.fsO=arrRow[0].fast; //ultimo
                        iNuevo.fsH=d3.max(arrRow, e => e.fast); 
                        iNuevo.fsL=d3.min(arrRow, e => e.fast); 
                        iNuevo.fsC=arrRow[arrRow.length - 1].fast; //ultimo

                        iNuevo.stO=arrRow[0].standard; //ultimo
                        iNuevo.stH=d3.max(arrRow, e => e.standard); 
                        iNuevo.stL=d3.min(arrRow, e => e.standard); 
                        iNuevo.stC=arrRow[arrRow.length - 1].standard; //ultimo

                        iNuevo.saO=arrRow[0].safe; //ultimo
                        iNuevo.saH=d3.max(arrRow, e => e.safe); 
                        iNuevo.saL=d3.min(arrRow, e => e.safe); 
                        iNuevo.saC=arrRow[arrRow.length - 1].safe; //ultimo

                        arrNuevoEC.push(iNuevo)
                        arrRow=[];  
                    }
                }
            });
            collectionBarEC.insertMany(arrNuevoEC, (err, res) => {
                if (err) {
                    console.log("   5 error insertoneEC...");
                } else {
                    console.log("   ✅ 5 insert EC ok.");
                }
            });
        });
        
    }
    catch (e) {
        console.log(e.message)
    }

    collection = client.db("fireth").collection("gasEG");
    try {
        var arrNuevoEG=[]
        collection.find({}).toArray(function (err, result) {
            console.log("adentro de collection...");
            var arrRow=[];
            var _a = new Date(result[0].datetime);
            var _stop = addM(_a,2);
            result.forEach(e => {
                //tomar mediciones de cada dos minutos y armar ohlc
                _actual =new Date(e.datetime);
                if (_actual<=_stop) {
                    //acumular ohlc, mando a array
                    let row ={}
                    row.datetime= e.datetime
                    row.fastest=e.fastest
                    row.fast=e.fast
                    row.standard=e.standard
                    row.safe=e.safe
                    arrRow.push(row)
                }                
                else {
                    //generar ohlc row
                    _stop = addM(_actual,2);
                    let iNuevo={}
                    if (arrRow[0]==null) {
                        let ssss=0;
                    }
                    else {
                        iNuevo.d=arrRow[0].datetime
                        iNuevo.ftO=arrRow[0].fastest; //ultimo
                        iNuevo.ftH=d3.max(arrRow, e => e.fastest); 
                        iNuevo.ftL=d3.min(arrRow, e => e.fastest); 
                        iNuevo.ftC=arrRow[arrRow.length - 1].fastest; //ultimo

                        iNuevo.fsO=arrRow[0].fast; //ultimo
                        iNuevo.fsH=d3.max(arrRow, e => e.fast); 
                        iNuevo.fsL=d3.min(arrRow, e => e.fast); 
                        iNuevo.fsC=arrRow[arrRow.length - 1].fast; //ultimo

                        iNuevo.stO=arrRow[0].standard; //ultimo
                        iNuevo.stH=d3.max(arrRow, e => e.standard); 
                        iNuevo.stL=d3.min(arrRow, e => e.standard); 
                        iNuevo.stC=arrRow[arrRow.length - 1].standard; //ultimo

                        iNuevo.saO=arrRow[0].safe; //ultimo
                        iNuevo.saH=d3.max(arrRow, e => e.safe); 
                        iNuevo.saL=d3.min(arrRow, e => e.safe); 
                        iNuevo.saC=arrRow[arrRow.length - 1].safe; //ultimo

                        arrNuevoEG.push(iNuevo)
                        arrRow=[];  
                    }
                }
            });
            collectionBarEG.insertMany(arrNuevoEG, (err, res) => {
                if (err) {
                    console.log("   5 error insertoneEG...");
                } else {
                    console.log("   ✅ 5 insert EG ok.");
                }
            });
        });
        
    }
    catch (e) {
        console.log(e.message)
    }

    collection = client.db("fireth").collection("gasGN");
    try {
        var arrNuevoETH=[]
        collection.find({}).toArray(function (err, result) {
            console.log("adentro de collection...");
            var arrRow=[];
            var _a = new Date(result[0].datetime);
            var _stop = addM(_a,2);
            result.forEach(e => {
                //tomar mediciones de cada dos minutos y armar ohlc
                _actual =new Date(e.datetime);
                if (_actual<=_stop) {
                    //acumular ohlc, mando a array
                    let row ={}
                    row.datetime= e.datetime
                    row.e=e.ethPrice
                    arrRow.push(row)
                }                
                else {
                    //generar ohlc row
                    _stop = addM(_actual,2);
                    let iNuevo={}
                    if (arrRow[0]==null) {
                        let ssss=0;
                    }
                    else {
                        iNuevo.d=arrRow[0].datetime
                        iNuevo.O=arrRow[0].e; //ultimo
                        iNuevo.H=d3.max(arrRow, x => x.e); 
                        iNuevo.L=d3.min(arrRow, x => x.e); 
                        iNuevo.C=arrRow[arrRow.length - 1].e; //ultimo
                        arrNuevoETH.push(iNuevo)
                        arrRow=[];  
                    }
                }
            });
            collectionBarETH.insertMany(arrNuevoETH, (err, res) => {
                if (err) {
                    console.log("   5 error insertone ETH...");
                } else {
                    console.log("   ✅ 5 insert ETH ok.");
                }
            });
        });
        
    }
    catch (e) {
        console.log(e.message)
    }

    console.log("fin2")

}

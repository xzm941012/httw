'use strict';

const electron = require('electron');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');
//const request = require('request');
const userrequest = require("request").defaults({jar: true});
const {app, BrowserWindow, Menu, ipcMain, ipcRenderer} = electron;
let http = require("http");
let viewstate;

let isDevelopment = true;

if (isDevelopment) {
    require('electron-reload')(__dirname, {
        ignored: /node_modules|[\/\\]\./
    });
}


var mainWnd = null;

function createMainWnd() {
    mainWnd = new BrowserWindow({
        width: 800,
        height: 600,
        icon: 'public/img/app-icon.png'
    });

    if (isDevelopment) {
        mainWnd.webContents.openDevTools();
    }

    mainWnd.loadURL(`file://${__dirname}/index.html`);

    mainWnd.on('closed', () => {
        mainWnd = null;
    });
}

ipcMain.on('login-message', function (event, arg) {
    let username = arg[0];
    let password = arg[1];
    userrequest.get("http://portal.hnisi.com.cn/sso/login?service=http%3A%2F%2Fportal.hnisi.com.cn%2F",  function (err, res, body) {
        //console.log(body);
        let $ = cheerio.load(body);
        var lt = $('input[name="lt"]').attr('value');
        var url = "http://portal.hnisi.com.cn" + $('form').attr('action');
        var execution =  $('input[name="execution"]').attr('value');
        userrequest.post(url,{form:{username:username,password:password,submit:'',lt:lt,execution:execution,_eventId:'submit'}}, function (err, res, body) {
            var lourl1 = res.headers.location;
            if (typeof(lourl1) == "undefined") {
                event.sender.send('login-response',"loginfalse");
                return;
            }
            userrequest.get(lourl1,function (err, res1, body) {
                userrequest.get("http://portal.hnisi.com.cn/",function (err, res2, body2) {
                    userrequest.get("http://portal.hnisi.com.cn/portal/main.jsp.portal.xhtml",function (err, res3, body3) {
                        userrequest.get("http://gs-scgl.hnisi.com.cn/scpt/gzl/filltask/query_FilltaskCalander.xhtml").pipe(iconv.decodeStream('GBK')).collect(function(err, decodedBody) {
                            let $ = cheerio.load(decodedBody);
                            //viewstate = $('input[name="javax.faces.ViewState"]').attr('value');
                            viewstate = "H4sIAAAAAAAAAOVca3Abx31fvsSH6EiWHEdOIuck2QYZQyBeB4BSlFh8SEINki5JWbLcDnK8OxBHAXenu4VwlCOPlI7rRGpteeLETmM3TVxP1Nay3WQSPztpJh%2Fapk1m6pl%2B6UynaUYkrZm2mel0mrYf2u7uPXAA74A9kGbTKT6Ad4t9%2FPb%2F%2BO1%2F%2F7fHV%2F4J9FQ0sPvR3BJ3nouUOHkxMrOwJPLw8LWfnP76Tn241AmAoQIAunQNHFK0xQi3xBnJJb0Q4VS1JPEclBQ5chQVzkEOilOczC2K2j3zmijOQa0CK5o4rQji55%2F%2B%2BfM%2FLBzoH8TdXQCgG4ADdb3xSllVZFGGpK%2BHJbE6qygQ9OfP25fmpwMcwFiNSIHjRd3VrAjLpcgJ9HVM0cqg%2F1xF1JbJpfnpAZ%2F0Gc9paE%2BiooPuvCQkgf1J8DKuHynKki5FChpXFquKdjZS14%2Fu6kgTOdAvCXlZgfPcooM85I38ZHaaK0vy4rgiQ06SRQ1sa2i4j0BXOb4oRsrLVvuKDhEmQTofmZDOr59wX6Dh0GjxIMNhAY1aDXaAEG6gSXzRVylzqDc0Ug9qFos5gr2%2FhSqPa5xalPhsGdmU2TbutA02ZsJp98kWY44r5TInCzlJPgsGChJSeTG%2FAOU2x01uYK5sm2Om2pprH9KvuoGZpgPOlJCAe7qZ9lRUkUsKf3YDwEcDAndhjkfbGzMea2uu22vm2KYfxGv2SOHkt%2FGaBEVN4h7iZLFktRtsCXmmAtUKzHELqA0ZtGYaB2s0qvMqjAiaogpKVY5MWBe4fVZGzedFA4LdNoD8ea5UEfOnp7ITTl%2F3tYAxJeq6rahETVFB0Sfim4V%2B9tSZ%2BfZhsJsHI3e6fRg1L32AblXkuZIoC5wWcVCNWyWg5xwhAQHFDZvY67ZzuMO802OYZt0%2FVpF5HMmQSSZjG2lcs5cwnW%2BPVSDEjckK3p5fJ9k2B92uiboIrRv7E6OZdH0%2FvZpYKIl6MQi97EB64ua5hZI4Ky5Kzvi9AaewqyqKZ5Hq81BZXCyJ7a8EyZptB0PQq2riKQSizWFH2xy2DxYlvf1x2Wi748qIVurGbcUixEFPSIIgylag%2BqCuL9mtq1cCdbDDnDTSuFXQDgrUCboSxxVBwp6r230YlXPgcXLV6Vx1eZT1OFe97k2KquLifrRXup3sqCpQQmNzenGKU3t6%2F%2FYHP7zzs3%2FdBTqPgYGSwgnHOB4qWhb0wyJyw6JSEgz1Mw%2BQXgerfeh7J4Gkqqi%2FnbX%2Bcgpmv8f%2F%2FfbPvhD9j3%2FsBN1Z0FdEY%2FBon5UDvbxSkaG2DMEusqsbwbu6EbQXQyH%2F4Rzow7cVtC5ioLeh6uc5tDTIkNwa6n%2BjD9pqQdDJy7hoBwQDJ%2Bancvmxo3PZcQhGRvCSM7J4oTRSkEolyOlnR4hC88esW8TDyFRELWJgwSPkH6rtLXMKwnD15rW%2FevrA33eCjl8BPWRJMuzpkUrTlfKCqP3mK1%2Feu%2F3Zn16195%2F4w9XE70iYNBlTlJLIyT9mtEt%2F88J%2F%2FjPq%2BozdtQpwmz1EL3vMS9R2d02aRzWNW85JOjQuv7f3q3%2FGvdgFOrKgW5cuiGTgjmo3%2FvawhjvrbMDZf6nQnI1tibgMV7xbx98D6xTcAcEevOLpFZm0KIlofZs6OvtgPjsBQV88lo6yyVQcmYH3h3R7FxYKQdrjgXQ3mvKwD6mfzNb2vfeQPXz34tDE9QuzP%2BkEA2dAX76gaLyYFc6A7fblnAhzaAeI7iwj2p7XIafBObhcsu1qp6tovMTpulU%2BYJbjyMRVoqjutjtqJe6m%2FaTY3VKvqKJGMNdbu5XDwPqzhORWFdncIy35JAT0SE0gsyI2ZVFT%2FXSHi%2FchLbFCNJ7kCryPljx00l2DhCqgMM0xoENO5sBn1E57VNM2khl0iXMOaF%2BPBLEbGb6EQyDcl9WR0WAq%2FkaN5GNlHzCoj3qAOtQUW0c9NnbBoBvXy2wb3Wq%2FR0yBiR2hsRUFwT3%2BkA85P9GBj4s1dTpT6CNT6PMVHc6kYNHta4LDrEUJIrYxCZJMDaE%2FRN%2F3tQR1CFenQ5ZIeohnB8G3wwPLTjcqMxGExPTx%2BpDFjE9q2gxRAY7F6BBH0%2Bv8E610saing97psezbyOOo3e1ukic5AWq4lKqPcQYGeKe5wo5IeAx9RFBgIrIoFRzs62bUwXpOaL0CEsQufo0ad4IOtyh4iNkH1Me9QypX5q1xPcWpEAjCrRHXuqCEHTVDrdC61VhEQZe4yPHLUyIsKsKYJAsomgLmpwOFGznQUYbgY2QJMkbE0ohZcdJAOwNdRwEmWov8ekZYG2vbPeNsuQbuMmePqjbW%2B%2FbIj67e%2FEXyqU5Sb7dTr1bjpSeuzP3Lmfc%2BRcIohOATNgKP3rJltfR3s49nBh%2F50s%2FxyFg6n6%2BmwYEDj2lV7YK9wR7j%2BLNo9mMo4IqYIp6tXnQHcGas2fhcwYpAb7z38NqtvY8dd%2BI6VTWqBSAEjCuZB2KjyXA6zXBk531kPwXG%2FcSbBm%2B%2B887KlW%2BsvPpbq1%2B45ljn%2FVJhaN%2BSfpT0doy0GArVDCg0PPyYJsKKJh%2B%2BeJh2hV%2Fvb8mA%2FpakM9xCYpNojSX4CtT4WDp8fOoD5rFUQLmm6HALoxvmMSerThBeQEFna4R2EzqQHIo562p2kJqdgOws%2BjRzKRWQ79%2Fnz2sP471SA60NWpTh2QwBJW38OGuPw0UN1aoDlx796Z%2F%2B1zOdFsH8BhrhbhcpNVTHnNT19vWFT9z7F8%2FbnPSdahTc6%2B%2FvimqFD8JF0Ltg7gwxySyBYmCSiUfj4TTL2EJsRjOuYfcbhkFU8jj5vky%2Bn6iyYJ9%2Fc6x0bx7FjZ%2B0mVIAC%2B1OojVTWhjqePLmmzdWb3zTsf5hL560DXaTWDId0JvTdI6ysH4L3R5LZgKyZIYOX4bdVJb0C6xqz8tsSqIIpWqN6OYymvEnJVz8GvnxdfL9bfL93S106lg0zMbbcWoi78G1Z7%2Fz%2FmtvvP%2Btl249e9nRwi7T8BlTUlp1aHgDHjAa0APoNmxsamFzPCAeDeYB8SgdvrT4wcYJ8VgwucbptpVsOrbhOMH9aNf2y4NBtjh0W0o2mfyldszRcCravmOuPvfyyvefW3nt3ZUnXnb08FHLMRVVxNGEosFTKM5RfB3UMKhMyQnlmSZaIhXpFMN6pSa6WdU47GlGPsme%2Bif2dtZnqAnEugZ0UOOcR95nkOR9Bj1gfdgbqnkyoDGPQp40txYq3ZLPJgTLMm594621r7269uqltW%2B9TpKtHgcL6Mh6j8fVXueq33uunsNBEKV5kI%2Fz3bV8WIRCla5BqBLIbCIKwX2u3KpeRB4XsdLIihbhS5IoQ5L3r3%2ByhU%2F5TXHq4A%2F%2B7dMH711a7cKJkAGcSOc03BBRuZmUx5VHxp3yw0grZhoT4egIY5AdUbMEYGf2386YD3U8OGoMRPzJgldk8zEfwhoxyoYhCXWBtvm4ALPWOaAEZ63ReDjOphkCrRlnecGwyAtPYo%2FlTR%2Fp8OQlkxG2VyUBFg%2FFk2nVgGCbTrYIJlfIlVJpfROrZ7uCn%2Bmj9YqHoEs%2Fh2r8TEfbPB4yRkSXBIbTGfxgMWwgyEs8vhVEyEklpqApZWYsPzf%2B0Hz%2B%2BJkc6uj0acZgqkVkqVZbSR6y%2BkLSKqMC0mYhj0WcRyLOa1XDYDSrjWaaXL5Q4haPhGIhBokZFWrVwgXtSOjQYxUdCX1RhCfRX0kYGr4YGiZVDFc7xmk4hCCoF%2BCRUDQeYhSNcW4TqJkjjW6oVUQ0%2B20mYAh6rXkiWytXSlAiAtxBvlBRgSvp4jqhehLFbV5PeqB1GglTkJv2rLNKLYkvQRlJRRNGS5pDkxY1TdF0X65rwtwJEqV07G2NmDIwiaUsqja3nWtXvrd66bLXHPApqi2kajIcnur9gcgXN6MjX3EU9z7iJkFCiwVqWsT1WA9OfACEKclIq16APoyogHJgRkzEkuFYJhWQEQmIej7EMxvdUjY0rcvNhl%2BzGIyQoJv6BIkkQTht2eIvNC3hCDPEc7qIS2QGcVZJWZTkkxZxTSCmMYmLKUlnRSYUiybuDTGQ1CU8iofPz42FGBSLia4yVCALJtthHPsQjSGaYyxaskmsB%2F%2BGOcyC6XCY19wDezxL6%2FF0WWHWfFhe8%2Fg%2Ffmfld696e3zu9JZ6PBquHY%2FPnabzeL7g7fFPbanHl4zN9PhELJxIZAJ7PALxv%2B%2Fx2LpcHt%2BRoPB4wfJ5IUK83vbU3Gkz%2BBAi5GgK8cfsNDM0N5mbHJ9nxo%2FOTTKnTkxOM3Mnx%2BbmZ4dmIjOzx7MT4Wg4Ofy5z4Wi0RCpjoghHkU3YcwQ9kXSuojH7JKUXRLFF8PMPO45hH%2FGHU3m0GD%2B40xOTzDHZmemmLlH5tCPzAwGNjvJWFWZI03oa5iZmZ2YnGXGHmEmInMPTeZyW8pEGVomosu8snzcZKL%2BlWeu37r0xdWrf4Dv7mgwlF%2BdODo%2FScdD%2FfTs00NOK6PhPhPw4LPtXbW9YTNpkFF8pNFVLw2BxXohR4lMcN5s9b0Ns9VRcJCSKAiMzaSrZCKcDhqfmCDaoqtYPI7pqucU0bWLjEwBQzCwjD4Hp6YOCsLmmJV1CJ4A%2FG7zw0hmTTrb4DK4w7ec%2Fr1N48cbNg367byJw8c2VCC3YRsZfK6gDdvIb7JxWDKmtY4aY%2FY0MmYSn7TyeZXBPO5ov8JAxyakSzpuXVhols%2Fpxq8AeOj%2FRfBFOsk%2FGiJCCv36xSaRD560tcNuVs2j3zzq2Nu0fgT%2BPLhpsYlwimXwnGktawvm5%2FO0uum5H76IpCHOnmv5vLqdkz2WmFo%2Fr3ZQ7HeOSH7EPO7tvm7yEwS3qZrCI9GZZ6HI5oN0aj3axqoaPqzWnzbPylBcFLVdP%2Fu93%2F%2FF5Scznfi8uHXaHPd6xyU0d3NkwoP%2FWrsP6rZmkuUfWjsjZZIlIzan4tX%2FR66YCadS%2F0dcMQPuae0EsZa%2BuAjEduVE74uxDTjjh%2BqcMebrjQ1etc7LvJ7gfczHzcj08fN7dzrWfNGpRUSNf6J0O%2Fx82EOvScD4C5T031KnPOCC6zQdDbOjFDo1IZjHgfpWv%2F4yw7z%2F2jf9opltC0RoftHJuieoSZbyCWqSMp806jqO7qDyO93gYw7u1yExvM47mp%2BZd1WnAplKpdswBTLKB2QKbDiRpDAFE4JlCree%2FG2GWfuTV9s0hRFv2duvkKIOfF5ANUPVupcRa%2FHq%2FqZqIj1TpedSac7a49y98u5bK0%2B%2BvfaHz608%2FdLN77%2B4cuP5lWtPrXzhjdWvvL727PVfMp%2FOhJPxgD7dYoJ1TF1%2FE%2BCu7rP%2Bxcg5Eb498cSXv%2FLmG8kufOC0Ooik0GeHJ3DdS8JGA9s3kj8Eg4KkqyVuGSlfxltrnTsvWga5bqUIcraiEYl9uqLZid6GJnQckTRfn4Dgwyon4BO5BxcUBL98iIlHyXkQ17GLXrLH7qVnOI%2B3pW2ia3beaH0ryrlEDYsUBm%2F9zrX3n3t65Znrqy%2F8UY0r9lk9z5OOh%2FArzcOHrSM75Glr%2FSmden1SrzUZ2rWGLmOYYoOcuPfRhP3WuC3%2BZgRmVaUDF095U9NxkGjBCw%2BZw9i%2FTyDrbclW5wEMzlajo3Qnkn1RmQTW%2Fynm5ptXkEkxfktRW9YySmstdOcuUwmv9wgCWovzsr9tLgeaYLPr0sGL8t72cgIkW2hm3honkMFUQSWwwSSjJGFLaTCesEyL2bb6wivIXjbTXNgopbmwdIc3UrHCJpiL%2FT8aaMzFrksJL96uuUxb42yBuaQDmIsnLItgEL9cxfzyaVqLQTt4r%2B2nT5q%2B9s8wGreg5v%2BpqHst3KlLlatPFexcfW2Qc17p%2Bs4bG07XN01QOKP7pG%2FaSRFmorEwm2idpK%2BN7Zeap9dV4%2F8dIZ71CgR3uTyrvgadnvgFS0%2BNA3hr690NaysLWMrHGieyExOT06cmJx%2BcnJ7wUV87%2FpmJJsPpaMBnLPVgNkWfdf8CxlOfdTXo9CmINX3WNffW519urT4nx2emJ7Lz2ZnpTdVnqi19usD46ROV4rJd%2FwMGM4vnq1QAAA%3D%3D";
                            //console.log(viewstate);
                            var postparama = {
                                form:{
                                    'queryForm%3Aid_notTag%3AnotTag%3Acriteria_value_XMID':'',
                                    '_queryForm%3Aid_notTag%3AnotTag%3Acriteria_value_XMID':'',
                                    'queryForm%3Aid_notTag%3AnotTag%3Acriteria_value_RWZT':'',
                                    '_queryForm%3Aid_notTag%3AnotTag%3Acriteria_value_RWZT':'',
                                    'queryForm%3Aid_notTag%3AnotTag%3Acriteria_value_RWLX':'',
                                    '_queryForm%3Aid_notTag%3AnotTag%3Acriteria_value_RWLX':'',
                                    'queryForm%3Aid_notTag%3AnotTag%3Aqdate':'2016-11-21',
                                    'queryForm%3Aid_notTag%3AnotTag%3Aqdate_':'2016-11-27',
                                    'queryForm%3Aid_notTag%3AnotTag%3Aquery':'%B2%E9++%D1%AF',
                                    'queryForm%3AqueryKssj':-1,
                                    'queryForm%3AisWeekendHidden':false,
                                    'queryForm%3AisHideCoditions':true,
                                    'ids':'',
                                    'queryForm_SUBMIT':1,
                                    'queryForm%3A_link_hidden_':'',
                                    'queryForm%3A_idcl':'',
                                    'javax.faces.ViewState':viewstate
                                }
                            };
                            userrequest.post("http://gs-scgl.hnisi.com.cn/scpt/gzl/filltask/query_FilltaskCalander.xhtml",postparama).pipe(iconv.decodeStream('GBK')).collect(function(err, decodedBody1) {
                                console.log(res.request.param);
                                let $1 = cheerio.load(decodedBody1);
                                viewstate = $1('input[name="javax.faces.ViewState"]').attr('value');
                                event.sender.send('login-response',decodedBody);
                            });
                         });
                    });
                });
            });
        });
    });
});

app.on('ready', createMainWnd);

app.on('window-all-closed', () => {
    app.quit();
});
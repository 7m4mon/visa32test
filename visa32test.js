/************************************************************

 VISA32TEST.JS
 
visa32test.js is a prototype for using VISA ( Virtual Instrument Software Architechture) 
library in node.js.

This is a wrapper for visa32.dll ( in your system32 folder).

I tested this code on Windows 7 (32bit), Keysight IO Library (17.1), node.js(0.10.26) .

Please test on your insturment (e.g. GPIB, RS232, LAN etc...) and fork me, and
develop complete VISA module. (like pyVISA)

to use...

> npm install ffi
> npm install ref
> npm install ref-array
> node visa32test.js

Author : 7M4MON
Date : 2015/04/24
Licence : MIT

************************************************************/


var ref = require('ref');
var ffi = require('ffi');
var ArrayType = require('ref-array')

// typedef
var ViError = ref.types.int;
var ViSession = ref.types.int;

//var ViRsrc = ref.types.CString;
//var ViAccessMode = ref.types.int;
//var ViUint32 = ref.types.int;

// for viScanf
var byte = ref.types.byte;
var ByteArray = ArrayType(byte);

// not used
//var StrArray = ArrayType(stringAry);
//var StrArrayPtr = ref.refType(StrArray);
//var replyString = ref.types.CString;
//var replyStringPtr = ref.refType(replyString);

var visa32 = ffi.Library('visa32', {
	'viOpenDefaultRM': [ViError, ['string'] ] ,							//viOpenDefaultRM(sesn)
	'viOpen' : [ViError, ['int', 'string', 'int', 'int', 'string'] ],	//viOpen(sesn, rsrcName, accessMode, timeout, vi) 
    'viPrintf' : ['int',['int', 'string']],
    'viScanf' : ['int',['int', 'string', ByteArray]],
	'viClose' : ['int', [ViSession] ]
});


exports.Visa32TestQuery = function (visaAddress, queryString){
	return Visa32TestQuery(visaAddress, queryString);
};

function Visa32TestQuery(visaAddress, queryString){

	var resourceManager = '0';
	var viError = 0;
	var session = 0;
	var replyString = '';

	// intialize Buffer
	var replyBuff = new ByteArray(256);
	var counter;
	for  (counter = 0 ; counter < 256 ; counter++){
		replyBuff [counter] = 0 ;
	}


	viError = visa32.viOpenDefaultRM('0');

	//console.log(viError);

	//var visaAddress;
	//visaAddress = 'GPIB0::22::INSTR'

	console.log("ADDR : " + visaAddress);
	viError = visa32.viOpen('256', visaAddress, '0', '2000', '256');

	//var queryString;
	//queryString = "*IDN?";
	viError = visa32.viPrintf('1', queryString + "\n");

	console.log("SEND : " + queryString);

	viError = visa32.viScanf('1', "%s", replyBuff);
	visa32.viClose(resourceManager);

	// make reply string
	counter = 0;
	while(replyBuff[counter] != 0){
		replyString +=  String.fromCharCode( replyBuff [counter] );
		counter ++;
	}

	console.log("RECV : " + replyString);
	return replyString;
}

// if you use as module, please comment out below:
//Visa32TestQuery('GPIB0::22::INSTR','*IDN?');
var fs = require('fs');
var commercialCropProduction = [];

function convertCSVToArray(data){
  var strDelimiter = (strDelimiter || ",");
  var objPattern = new RegExp((/* Delimiters*/   "(\\" + strDelimiter + "|\\r?\\n|\\r|^)"
  /*Quoted Text */+ "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|"
  /*Normal Text*/ + "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
  var arrData = [[]], arrMatches = null;
  while (arrMatches = objPattern.exec(data))
  {
    var strMatchedDelimiter = arrMatches[1];
    if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter))
    arrData.push([]);
    var strMatchedValue = arrMatches[2] ? arrMatches[2].replace(new RegExp("\"\"", "g"), "\"") : arrMatches[3];
    arrData[arrData.length - 1].push(strMatchedValue);
  };
  return (arrData);
}

function initializeFirstRecord(commercialCropProduction , array){
  commercialCropProduction[0] ={};
  var columnsToSkipLookUp = ["Frequency" ,"Unit"];
  for(z = 0 ; z < array[0].length; z++)
  {
    var key = array[0][z];
    if(key.indexOf(' 3-') > -1){
      commercialCropProduction[0][key] = parseInt(0);
    }
    else{
      commercialCropProduction[0][key] = 'Commercial Crops Aggregate';
    }
  }
  for (var i = 0; i < columnsToSkipLookUp.length; i++) {
    delete commercialCropProduction[0][columnsToSkipLookUp[i]];
  }
}

function removeEntriesByKeywords(jsonObject)
{
  return  jsonObject['x'].indexOf('Area') == -1
  && jsonObject['x'].indexOf('Volume') == -1
  && jsonObject['x'].indexOf('Yield') == -1
  && jsonObject['x'].indexOf('Other') == -1
  && jsonObject['x'].indexOf('Major') == -1
  && jsonObject['x'].indexOf('Oilseeds Nine') == -1;
}

function identifySuperSets(array)
{
  for(i=0; i < array.length ; i++){
    for(j=i+1 ; j < array.length ; j++){
      if((array[j]['x'].indexOf(array[i]['x'])) > -1 ){
        array[i]["isSuperSet"] = true;
      }
    }
  }
}

function csvToJSON()
{
  fs.readFile('agriculture.csv', 'utf8', function (err,data) {
    var array = convertCSVToArray(data); //convert CSV Data to Array
    // Keys to Fetch Particular Year Data
    var singleYearProductionKeys = ['Foodgrains', 'Oilseeds']; //Keys to extract Production Data of Year 2013
    var columnLookupTable = ['Particulars',' 3-2013']
    for(var y = 0; y < singleYearProductionKeys.length; y++)
    {
      var singleYearProduction = [];
      for (var i = 1 ; i < array.length; i++) {
        var index = array[i][0].indexOf(singleYearProductionKeys[y]);
        if(index > -1 &&  index == array[i][0].lastIndexOf(singleYearProductionKeys[y]))
        {
          singleYearProduction[i-1] =   {x : 0 , y : 0};
          singleYearProduction[i-1].x = array[i][array[0].indexOf(columnLookupTable[0])];
          singleYearProduction[i-1].y = array[i][array[0].indexOf(columnLookupTable[1])] == "NA" ? 0 : parseInt(array[i][array[0].indexOf(' 3-2013')]) ;
        }
      }

      singleYearProduction = singleYearProduction.filter(function(e){return e});
      identifySuperSets(singleYearProduction); //identify Cumulative data from the array
      singleYearProduction = singleYearProduction.filter(function(e){return e.isSuperSet == undefined});//remove Cumulative data from the array
      singleYearProduction = singleYearProduction.filter(removeEntriesByKeywords); // Remove unwanted entries using Keywords
      writeJSONFile(singleYearProduction,singleYearProductionKeys[y]); // writing the stringified JSON to file
    }


    // extract commercial crop production data
    var commercialCropProductionKeys = ['Commercial'];
    initializeFirstRecord(commercialCropProduction , array);
    for(var y = 0; y < commercialCropProductionKeys.length; y++)
    {
      for (var i = 0 ; i < array.length; i++)
      {
        if(array[i][0].indexOf(commercialCropProductionKeys[y]) > -1)
        {
          for(z = 0 ; z < array[0].length && z < array[i].length; z++)
          {
              var key = array[0][z];
              //accumulate data on iteration
              commercialCropProduction[0][key] += array[i][z] == "NA"  ? 0 : isNaN(Number(array[i][z])) ? "" : Number(array[i][z]);
          }
        }
      }
      writeJSONFile(commercialCropProduction ,"Commercial");
    }


    var allYearProduction =[];
    var allYearProductionKeys = ['Rice Yield Andhra Pradesh' , 'Rice Yield Kerala' , 'Rice Yield Tamil Nadu' , 'Rice Yield Karnataka'];

    for(var y = 0; y < allYearProductionKeys.length; y++)
    {
      for (var i = 0 ; i < array.length; i++)
      {
        if(array[i][0].indexOf(allYearProductionKeys[y]) > -1)
        {
          allYearProduction[i] = {};
          for(z = 0 ; z < array[0].length && z < array[i].length ; z++)
          {
            var key = array[0][z];
            allYearProduction[i][key] = array[i][z] == "NA" ? parseInt(0) : array[i][z];
          }
        }
      }
    }

    //calculating yearly Production of states
    var yearlyProductionAggregate =[];
    allYearProduction = allYearProduction.filter(function(e){return e}); //filtering data (remove empty entries)
    var lookupTable =["Tamil Nadu","Karnataka","Kerala","Andhra"] //lookup table of southern states
    for (var z = 3; z < array[0].length; z++)
    {
      var key = array[0][z]; //taking key from header value
      yearlyProductionAggregate[z-3] = {Year : key.substr(key.indexOf("-") + 1,key.length), TN : 0 , KA : 0 , KE : 0 , AP : 0}; //initializing the Value with Custom Keys
      for (var i = 0; i < allYearProduction.length; i++)
      {
        if(allYearProduction[i]["Particulars"].indexOf(lookupTable[0]) > -1) //Tamilnadu
        {
          yearlyProductionAggregate[z-3].TN = allYearProduction[i][key];
        }

        else if(allYearProduction[i]["Particulars"].indexOf(lookupTable[1]) > -1) //Karnataka
        {
          yearlyProductionAggregate[z-3].KA = allYearProduction[i][key];
        }

        else if(allYearProduction[i]["Particulars"].indexOf(lookupTable[2]) > -1) //Kerala
        {
          yearlyProductionAggregate[z-3].KE = allYearProduction[i][key];
        }

        else if(allYearProduction[i]["Particulars"].indexOf(lookupTable[3]) > -1) //Andhra pradesh
        {
          yearlyProductionAggregate[z-3].AP = allYearProduction[i][key];
        }
      }
    }
    writeJSONFile(yearlyProductionAggregate ,"South_Indian_States_Aggregate");
  });
}

function writeJSONFile(jsonObject,filename)
{
  // remove empty values from the JSON Array
  jsonObject = jsonObject.filter(function(e){return e});
  fs.writeFile(filename + ".json", JSON.stringify(jsonObject));
}

csvToJSON();

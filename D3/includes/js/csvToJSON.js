var fs = require('fs');
var foodGrainsProduction = [];
var oilSeedsProduction =[];
var commercialCropProduction = [];
var yearlyProductionAggregate = [];
var keywordLookupTable = ['Foodgrains', 'Oilseeds','Commercial','Rice Yield Andhra Pradesh' , 'Rice Yield Kerala' , 'Rice Yield Tamil Nadu' , 'Rice Yield Karnataka']; //Keys to extract Production Data of Year 2013
var fgrainsAndOseedsColumnLookupTable = ['Particulars',' 3-2013',' 3-1993',' 3-2014'];
var columnRenameLookupTable = ["Agricultural Production Foodgrains","Agricultural Production Oilseeds"];

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

function removeEntriesByKeywords(jsonObject)
{
  return   jsonObject['x'].indexOf('Area') == -1
  && jsonObject['x'].indexOf('Volume') == -1
  && jsonObject['x'].indexOf('Yield') == -1
  && jsonObject['x'].indexOf('Other') == -1
  && jsonObject['x'].indexOf('Major') == -1
  && jsonObject['x'].indexOf('Oilseeds Nine') == -1;
}

function removeSuperSets(jsonObject,stringToAppend)
{
  for(i=0; i < jsonObject.length ; i++){
    for(j=i+1 ; j < jsonObject.length ; j++){
      var current = stringToAppend + jsonObject[i]['x'] , next = stringToAppend + jsonObject[j]['x'];
      if(next.indexOf(current) > -1 ){
        jsonObject[i]["isSuperSet"] = true;
      }
    }
  }
 }

function initializeCommercialRecord(array , firstYearIndex , lastYearIndex){
  for(z = firstYearIndex ; z <= lastYearIndex; z++)
  {
      var key =array[0][z].replace(" 3-","");
      commercialCropProduction.push({ Year : key , Quantity : 0 })
  }
  return commercialCropProduction;
}

function writeJSONFile(jsonObject,filename)
{
  jsonObject = jsonObject.filter(function(e){return e});// remove empty values from the JSON Array
  fs.writeFile( "../json/" + filename + ".json", JSON.stringify(jsonObject));
}

function sortByKey(array, key) {
  return array.sort(function(a, b) {
    var x = a[key] , y = b[key];
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
}

function fillSingleYearProductionData(jsonObject,array,particularsIndex,productionIndex,substringKey){
  jsonObject.push({ x: array[particularsIndex].replace(substringKey,"") , y : array[productionIndex] == "NA" ? 0 : parseFloat(array[productionIndex])});
  return jsonObject;
}

function processSingleYearProductionData(jsonObject,substringKey){
  removeSuperSets(jsonObject , substringKey); //identify Cumulative data from the array
  jsonObject = jsonObject.filter(function(e){return e.isSuperSet == undefined});//remove Cumulative data from the array
  jsonObject = jsonObject.filter(removeEntriesByKeywords); // Remove unwanted entries using Keywords
  sortByKey(jsonObject,"y");
  return jsonObject;
}


function csvToJSON()
{
  fs.readFile('../../agriculture.csv', 'utf8', function (err,data) {
    var array = convertCSVToArray(data); //convert CSV Data to Array
    // Keys to Fetch Particular Year Data
    var particularsIndex = array[0].indexOf(fgrainsAndOseedsColumnLookupTable[0]);
    var productionIndex = array[0].indexOf(fgrainsAndOseedsColumnLookupTable[1]);
    var firstYearIndex = array[0].indexOf(fgrainsAndOseedsColumnLookupTable[2]);
    var lastYearIndex = array[0].indexOf(fgrainsAndOseedsColumnLookupTable[3]);

    for (var z = firstYearIndex ; z <= lastYearIndex ; z++)
    {
      yearlyProductionAggregate.push({Year : array[0][z].toString().replace(" 3-","") , TN : 0 , KA : 0 , KE : 0 , AP : 0}); //initializing the Value with Custom Keys
    }

    commercialCropProduction = initializeCommercialRecord(array,firstYearIndex,lastYearIndex);
    commercialCropProduction = commercialCropProduction.filter(function(e){ return e});
    for (var i = 1 ; i < array.length; i++)
    {
      if(array[i][0].indexOf(keywordLookupTable[0]) > -1 &&  array[i][0].indexOf(keywordLookupTable[0]) == array[i][0].lastIndexOf(keywordLookupTable[0])){
        foodGrainsProduction = fillSingleYearProductionData(foodGrainsProduction,array[i],particularsIndex,productionIndex,columnRenameLookupTable[0]);
      }

      else if(array[i][0].indexOf(keywordLookupTable[1]) > -1 &&  array[i][0].indexOf(keywordLookupTable[1]) == array[i][0].lastIndexOf(keywordLookupTable[1])){
        oilSeedsProduction = fillSingleYearProductionData(oilSeedsProduction,array[i],particularsIndex,productionIndex,columnRenameLookupTable[1]);
      }

      else if(array[i][0].indexOf(keywordLookupTable[2]) > -1){
        for(z = firstYearIndex ; z < lastYearIndex ; z++)
        {
            commercialCropProduction[z-firstYearIndex].Quantity += array[i][z] == "NA"  ? 0 : isNaN(Number(array[i][z])) ? "" : parseFloat(array[i][z]);//accumulate data on iteration
        }
      }

      var keyToFill = array[i][0].indexOf(keywordLookupTable[3]) > -1
                        ? "AP" : array[i][0].indexOf(keywordLookupTable[4]) > -1
                          ? "KE" : array[i][0].indexOf(keywordLookupTable[5]) > -1
                            ? "TN" : array[i][0].indexOf(keywordLookupTable[6]) > -1
                              ? "KA" : "false" ;

      if (keyToFill != "false")
      {
        for (var z = 0 ; z < yearlyProductionAggregate.length ; z++)
        {
          yearlyProductionAggregate[z][keyToFill] = array[i][z+firstYearIndex] == "NA" ? 0 : parseFloat(array[i][z+firstYearIndex]);
        }
      }
      foodGrainsProduction = processSingleYearProductionData(foodGrainsProduction,columnRenameLookupTable[0]);
      oilSeedsProduction = processSingleYearProductionData(oilSeedsProduction,columnRenameLookupTable[1]);
    }

    // writing the stringified JSON to file
    writeJSONFile(foodGrainsProduction,keywordLookupTable[0]);
    writeJSONFile(oilSeedsProduction,keywordLookupTable[1]);
    writeJSONFile(commercialCropProduction,keywordLookupTable[2]);
    writeJSONFile(yearlyProductionAggregate,"South_Indian_States_Aggregate");
  });
}

csvToJSON();

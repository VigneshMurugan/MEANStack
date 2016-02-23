function csvToJSON()
{
  var fs = require('fs');

  fs.readFile('agriculture.csv', 'utf8', function (err,data) {
    var array = convertToJSON(data);
    var singleYearProduction = [];

    // Keys to Fetch Paticular Year Data
    var singleYearProductionKeys = ['Foodgrains','Oilseeds','rice'];
    for (var i = 1 ; i < array.length; i++) {
      for(var y = 0; y < singleYearProductionKeys.length; y++)
      {
        if(array[i][0].indexOf(singleYearProductionKeys[y]) > -1)
        {
          singleYearProduction[i-1] = {};
          var requiredColumns =['Particulars' , ' 3-2013'];
          for(z = 0 ; z < requiredColumns.length ; z++)
          {
            var keyIndex = array[0].indexOf(requiredColumns[z]);
            singleYearProduction[i-1][requiredColumns[z]] = array[i][keyIndex] == "NA" ? 0 : array[i][keyIndex];
          }
        }
      }
    }

    var allYearProduction =[];
    var allYearProductionKeys = ['Commercial','Rice Yield Andhra Pradesh' , 'Rice Yield Kerala' , 'Rice Yield Tamil Nadu' , 'Rice Yield Karnataka'];

    initializeFirstRecord(allYearProduction , array);

    for (var i = 0 ; i < array.length; i++)
    {
      for(var y = 0; y < allYearProductionKeys.length; y++)
      {
        if(array[i][0].indexOf(allYearProductionKeys[y]) > -1)
        {
          allYearProduction[i] = {};
          for(z = 0 ; z < array[0].length && z < array[i].length ; z++)
          {
            var key = array[0][z];
            allYearProduction[i][key] = array[i][z] == "NA" ? parseInt(0) : array[i][z];
            if(y > 0 && Number.isInteger(parseInt(array[i][z])))
            {
                allYearProduction[0][key] += parseInt(allYearProduction[i][key]);
            }
          }
        }
      }
    }

    // remove empty values from the JSON Array
    allYearProduction = allYearProduction.filter(function(e){return e});
    singleYearProduction = singleYearProduction.filter(function(e){return e});

    fs.writeFile("singleYearProduction.json", JSON.stringify(singleYearProduction));
    fs.writeFile("allYearProduction.json" , JSON.stringify(allYearProduction));

  });
}

function convertToJSON(data){
  var strDelimiter = ",";
  strDelimiter = (strDelimiter || ",");
  var objPattern = new RegExp(("(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
  "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
  "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
  var arrData = [[]];
  var arrMatches = null;
  while (arrMatches = objPattern.exec(data)) {
    var strMatchedDelimiter = arrMatches[1];
    if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
      arrData.push([]);
    }
    if (arrMatches[2]) {
      var strMatchedValue = arrMatches[2].replace(
        new RegExp("\"\"", "g"), "\"");
      } else {
        var strMatchedValue = arrMatches[3];
      }
      arrData[arrData.length - 1].push(strMatchedValue);
    };
    return (arrData);
  }

  function initializeFirstRecord(allYearProduction , array){
    allYearProduction[0] ={};
    for(z = 0 ; z < array[0].length; z++)
    {
      var key = array[0][z];
      if(key.indexOf(' 3-') > -1)
      {
        allYearProduction[0][key] = parseInt(0);
      }
      else {
        allYearProduction[0][key] = 'Rice Yield Aggregate';
      }
    }
  }

  csvToJSON();

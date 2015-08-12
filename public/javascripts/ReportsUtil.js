var ReportsUtil = {

	cleanData: function (_data) {
		return _data.filter(function(_d) {
			var candidate = _d["Candidate  Name"];
			if(!candidate) {
				return false;
			}
            //If candidate is recommended for second round but details of second round are not there
            //in the data then reject
			if(_d["Interview Round"] === 1 && _d["Overall Recommendation"] >= 3) {
				var round2 = _data.filter(function(_f) {
					return _f["Candidate  Name"] === candidate && _f["Interview Round"] === 2; 
				});
				if(round2.length === 0) {
					return false;
				}
			}
            //If the current round is 2 and the details of round-1 are not there in data then reject
            if(_d["Interview Round"] === 2) {
                var round1 = _data.filter(function(_f) {
                    return _f["Candidate  Name"] === candidate && _f["Interview Round"] === 1; 
                });
                if(round1.length === 0) {
                    return false;
                }
            }
			return true;
		});
	},
	filterByDateRange: function (data, from, to) {

	    var fetchedData = $.grep(data, function(obj) {

	        var intDate = obj["Interview : Date & Time"],
	            intDate = intDate.replace("-", "/"),
	            intDate = intDate.replace("-", "/"),
	            intDate = new Date(intDate).getTime(),
	            startDate = new Date(from).getTime(),
	            endDate = new Date(to).getTime();
	        return (intDate <= endDate && intDate >= startDate);
	    });

	    //console.log(fetchedData);
	    return fetchedData;

	},
	getInterviewerNames: function(mainData) {
		var names = [];
		for (var ctr in mainData) {
			var record = mainData[ctr],
				name1 = record["Interviewer1"],
				name2 = record["Interviewer2"];
			if(name1 && names.indexOf(name1) === -1) {
				names.push(name1);
			}
			if(name2 && names.indexOf(name2) === -1) {
				names.push(name2);
			}
		}
		return names;
	},
	trackPersonData: function(interviewData, interviewers, rmdVal) {
	    var temp = {}, rmdVal = rmdVal || 3;
    
        for (var i = 0; i < interviewers.length; i++) {
            var _iName = interviewers[i];
            var counts = this.getRoundsTallyForData(interviewData, rmdVal, _iName);
            if(counts[1] !== 0) {
                temp[_iName] = {
                    "name": _iName.substr(0, _iName.lastIndexOf(" ")),
                    r1cnt: counts[0],
                    r2cnt: counts[1],
                    r3cnt: counts[2],
                    ratio: parseInt((counts[2]/counts[1]) * 100)
                };    
            }                        
        }
	    
    	//console.log(temp);
    	return temp;
	},

	fiterDataByTechnology: function(techData, mainData) {
	    var temp = {}
	    for (var tech in techData) {
	        for (var i = 0; i < techData[tech].length; i++) {
	            for (var j = 0; j < mainData.length; j++) {
	                var eachIntObj = mainData[j];
	                if (techData[tech][i] === (eachIntObj["Interviewer1"] || eachIntObj["Interviewer2"])) {
	                    temp[tech] = temp[tech] || [];
	                    temp[tech].push(eachIntObj);
	                }
	            }
	        }
	    }
	    return temp;
	},
	getRoundsTallyForData: function(filteredData, rmdVal, _iName) {
	    var cnt1 = 0, cnt2 = 0, cnt3 = 0, allNames = [];
	    for (var i = 0; i < filteredData.length; i++) {
	        var _cName = filteredData[i]["Candidate  Name"],
	            interviewRnd = filteredData[i]["Interview Round"],
	            overallRmd = filteredData[i]["Overall Recommendation"];
	        //TODO: Get All Names before hand and iterate over that array.
	        if(!_cName || allNames.indexOf(_cName) !== -1) {
	            continue;
	        } else {
	            allNames.push(_cName);
	        }
	        if (interviewRnd == 1) {
	            //filter for interviewer name
	            if(typeof _iName !== "undefined" && (_iName !== filteredData[i]["Interviewer1"] || _iName !== filteredData[i]["Interviewer1"])) {
	                continue;
	            }
	            
	            //If recommended for second round, check if second details present in data or not
	            if(overallRmd >= 3) {
	                var round2 = filteredData.filter(function(_x) {
	                    return _x["Candidate  Name"] === _cName && _x["Interview Round"] === 2;
	                });
	                if(round2.length === 0) {
	                    //recommended for second round but no second round, so do not consider.
	                    continue;
	                } else {
	                    //second round record is there so consider the record and increment cnt1
	                    cnt1 += 1;
	                    //Check for recommended value filter
	                    if (overallRmd >= parseInt(rmdVal)) {
	                        //recommended for second round with expected recommendation so incrment cnt2
	                        cnt2 += 1;
	                        var round2Rec = round2[0]["Overall Recommendation"];
	                        if(round2Rec >= 3) {
	                            //round2 recommendation is more than 2 so selected, increment cnt3
	                            cnt3 += 1;
	                        }
	                    };                    
	                }
	            } else {
	                //Not recommended for second round, so incrment cnt1 only
	                cnt1 += 1;    
	            }                
	        } else if(interviewRnd == 2){
	            var round1 = filteredData.filter(function(_x) {
	                return _x["Candidate  Name"] === _cName && _x["Interview Round"] === 1 && _x["Overall Recommendation"];
	            });
	            //first round details not found, do not consider
	            if(round1.length === 0) {
	                continue;
	            }

	            if(typeof _iName !== "undefined" && (_iName !== round1[0]["Interviewer1"] || _iName !== round1[0]["Interviewer1"])) {
	                continue;
	            }

	            var round1Rec = round1[0]["Overall Recommendation"];
	            if(round1Rec >= 3) {
	                //second round record is there so consider the record and increment cnt1
	                cnt1 += 1;
	                //Check for recommended value filter
	                if (round1Rec >= parseInt(rmdVal)) {
	                    //recommended for second round with expected recommendation so incrment cnt2
	                    cnt2 += 1;
	                    //overallRmd is second round recommendation
	                    if(overallRmd >= 3) {
	                        //round2 recommendation is more than 2 so selected, increment cnt3
	                        cnt3 += 1;
	                    }
	                };
	            } else {
	                //Not recommended for second round, so incrment cnt1 only
	                //Ideally this case should never come. If it comes here that means data is corrupted
	                console.log("Wrong Data Entry for candidate: '" + _cName + "', As second round detail shouldnot be there if the Overall recommendation in round1 is less than 3");
	                cnt1 += 1;    
	            }
	        }
	    }
	    return [cnt1, cnt2, cnt3];
	},
	eachInterviewerData: function(origData) {
	    var temp = {};
	    var secondRounds = [], interviewers = [];
	    for (var tech in origData) {
	        for (var person in origData[tech]) {
	            var personObj = origData[tech][person];

	            var intRnd = personObj["Interview Round"];
	            var canName = personObj["Candidate  Name"];
	            if(intRnd === 2) {
	            	secondRounds.push(personObj);
	            	continue;
	            }

	            var interviewerName = personObj["Interviewer1"] || personObj["Interviewer2"];
	            var intTime = personObj["Interview : Date & Time"];
	            intTime = intTime.replace(/-/g, '/');
	            intTime = intTime.substr(0, intTime.indexOf(" "));

	            
	            var orcm = personObj["Overall Recommendation"];
	            
	            var comments = personObj["Comments"];

	            temp[interviewerName] = temp[interviewerName] || {};
	            var intObj = temp[interviewerName];
	            interviewers.push(interviewerName);
	            intObj[intTime] = intObj[intTime] || {
	            	"Interview Time" : "",
	                "candidate_name": "",
	                "Interview Round": 0,
	                "Overall Recommendation": 0,
	                "Comments": ""
	            };

	            var subObj = intObj[intTime];

	            subObj["Interview Time"] = intTime;
	            subObj["candidate_name"] = canName;
	            subObj["Interview Round"] = intRnd;
	            subObj["Comments"] = comments;
	            subObj["Overall Recommendation"] = orcm;

	        }
	    }

	    for(var i = 0; i < interviewers.length; i++) {
	    	var _iName = interviewers[i];
	    	var _iData = temp[_iName];

	    	for(var key in _iData) {
	    		var info = _iData[key];
	    		var round2 = secondRounds.filter(function(d){
					return d["Candidate  Name"] === info["candidate_name"];
				});
				if(round2.length > 0) {
					info["round2"] = round2[0];
				}
	    	}
	    }

	    // console.log(temp);
	    return temp;
	},
	sortObject: function(o) {
	    var sorted = {},
	    key, a = [];

	    for (key in o) {
	        if (o.hasOwnProperty(key)) {
	            a.push(key);
	        }
	    }

	    a.sort();

	    for (key = 0; key < a.length; key++) {
	        sorted[a[key]] = o[a[key]];
	    }
	    return sorted;
	},
	mapDataByLabels: function(filteredData, reportsObj, rmdVal) {
	    var rmdVal = rmdVal || 3;

	    for (var prop in filteredData) {
	        var counts = ReportsUtil.getRoundsTallyForData(filteredData[prop], rmdVal);
	        
	        reportsObj['Interview Round 1'].push({
	            name: prop,
	            value: counts[0]
	        });
	        reportsObj['Interview Round 2'].push({
	            name: prop,
	            value: counts[1]
	        });
	        reportsObj['Selected Candidates'].push({
	            name: prop,
	            value: counts[2]
	        });

	    }
	    return reportsObj;
	}
};
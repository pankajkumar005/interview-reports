var interviewData = $.parseJSON($('#intData').val()),
    techData = $.parseJSON($('#techData').val()),
    origData,
    activated = [false, false, false];

interviewData = ReportsUtil.cleanData(interviewData);



$(function() {
    //$("#main").tabs();
    $("#main").tabs({
      activate: function( event, ui ) {
        //ReportsUtil.activateTab(event, ui);
        var idx = ui.newTab.index();
        if(!activated[idx]) {
            var fn = function() {};
            if(idx == 0) {
                fn = reports1Handler;    
            } else if(idx == 1) {
                fn = reports2Handler;   
            } else if(idx == 2){
                fn = reports3Handler;    
            }  
            setTimeout(fn, 100);
            activated[idx] = true;  
        }                
      }
    });

    $("#datepicker").datepicker({
        defaultDate: new Date(2014, 06, 01),
        changeMonth: true,
        changeYear: true,
        onClose: function(selectedDate) {
            $("#to").datepicker("option", "minDate", selectedDate);
        }
    });
    $("#datepicker1").datepicker({
        defaultDate: new Date(2014, 06, 01),
        changeMonth: true,
        changeYear: true,
        onClose: function(selectedDate) {
            $("#from").datepicker("option", "maxDate", selectedDate);
        }
    });

    $("#datepicker2").val($("#datepicker").val());
    $("#datepicker3").val($("#datepicker1").val());

    $("#datepicker2").datepicker({
        defaultDate: $("#datepicker").val(),
        changeMonth: true,
        changeYear: true,
        onClose: function(selectedDate) {
            $("#to").datepicker("option", "minDate", selectedDate);
        }
    });

    $("#datepicker3").datepicker({
        defaultDate: $("#datepicker1").val(),
        setDate: $("#datepicker1").val(),
        changeMonth: true,
        changeYear: true,
        onClose: function(selectedDate) {
            $("#from").datepicker("option", "maxDate", selectedDate);
        }
    });

    //Report3 -- settings:
    $("#datepicker4").val($("#datepicker2").val());
    $("#datepicker5").val($("#datepicker3").val());

    $("#datepicker4").datepicker({
        defaultDate: $("#datepicker2").val(),
        changeMonth: true,
        changeYear: true,
        onClose: function(selectedDate) {
            $("#to").datepicker("option", "minDate", selectedDate);
        }
    });

    $("#datepicker5").datepicker({
        defaultDate: $("#datepicker3").val(),
        setDate: $("#datepicker1").val(),
        changeMonth: true,
        changeYear: true,
        onClose: function(selectedDate) {
            $("#from").datepicker("option", "maxDate", selectedDate);
        }
    });
    //Report_1 Handlers
    function reports1Handler() {
        var fromDate = $("#datepicker").val(),
            toDate = $('#datepicker1').val();

        $("#datepicker2").val($("#datepicker").val());
        $("#datepicker3").val($("#datepicker1").val());

        console.log("fromDate " + fromDate);
        console.log("toDate " + toDate);

        var mainData = ReportsUtil.filterByDateRange(interviewData, fromDate, toDate);

        // console.log("mainData-----");

        var filteredData = ReportsUtil.fiterDataByTechnology(techData, mainData),
            rmdVal = document.getElementById('rp1-inputRmd').value,
            InterviewReportsData = {
                'Interview Round 1': [],
                'Interview Round 2': [],
                'Selected Candidates': []
            },
            mappedData = ReportsUtil.mapDataByLabels(filteredData, InterviewReportsData, rmdVal);

        // console.log(mappedData);
        var reports_def = {
            categories: ['Interview Round 1', 'Interview Round 2', 'Selected Candidates'],
            dataset: mappedData
        };

        $("#uv-div").html("");
        UVChartsUtil.reports_config.meta.position = '#uv-div';
        uv.chart('StackedBar', reports_def, UVChartsUtil.reports_config);
    }
    
    //Report2_Handlers
    function reports2Handler() {
         var fromDate = $("#datepicker2").val(),
            toDate = $('#datepicker3').val();

        var mainData = ReportsUtil.filterByDateRange(interviewData, fromDate, toDate);
        var rmdVal = document.getElementById('rp2-inputRmd').value;

        var interviewers = ReportsUtil.getInterviewerNames(mainData),
            personData = ReportsUtil.trackPersonData(mainData, interviewers, rmdVal);

        var report2_data = [];

        for (var person in personData) {
            var temp = {}
            temp["name"] = personData[person]["name"];
            temp["value"] = personData[person]["ratio"];
            report2_data.push(temp);            
        }

        report2_data.sort(function(a, b) {
            return a.name.localeCompare(b.name);
        });
        var reprots2_def = {
            categories: ['Individual'],
            dataset: {
                'Individual': report2_data
            }
        };

        //-- reports2 --
        $('#uv-div1').html("");
        UVChartsUtil.reports2_config.meta.position = '#uv-div1';
        UVChartsUtil.reports2_config.dimension.width = report2_data.length * 20;
        uv.chart('Bar', reprots2_def, UVChartsUtil.reports2_config);
        $('#tabs-2 svg g.uv-hor-axis').find('g.tick text').attr({
            "transform": "rotate(90)",
            "x": 5,
            "y": 20
        }).css("text-anchor", 'start');

    }

    //Report_1 attach Handlers
    $("#report1-tracker").on('submit', function(e) {
        e.preventDefault();
        reports1Handler();
    });
    //reports1Handler();
    //Report_2 attach Handlers
    $("#report2-tracker").on('submit', function(e) {
        e.preventDefault();
        reports2Handler();
    });
    //reports3Handler();
    var interviewerData;
    function reports3Handler() {
        var fromDate = $("#datepicker4").val(),
            toDate = $('#datepicker5').val();

        var mainData = ReportsUtil.filterByDateRange(interviewData, fromDate, toDate),
            filteredData = ReportsUtil.fiterDataByTechnology(techData, mainData);
        
        interviewerData = ReportsUtil.eachInterviewerData(filteredData);
        interviewerData = ReportsUtil.sortObject(interviewerData);
        $.each(interviewerData, function(key) {
            $select.append("<option>" + key + "</option>");
        });
        
        drawReport3();
    }
    function drawReport3() {
        var $select = $('#panel-names');
        var selectedName = $("#panel-names :selected").text() ;
        console.log(selectedName);

        var _iData = interviewerData[selectedName],
            interviews = [];
        for(var key in _iData){
            interviews.push({
                "name": key,
                "value": _iData[key]["Overall Recommendation"]
            });
        }

        //reprots 3 sample data
        var graphdef = {
            categories: ['Interviews'],
            dataset: {
                'Interviews': interviews
            }
        };

        //-- reports3 --
        $('#uv-div2').html("");
        UVChartsUtil.reports3_config.meta.position = '#uv-div2';
        UVChartsUtil.reports3_config.meta.caption = selectedName;
        uv.chart('Bar', graphdef, UVChartsUtil.reports3_config);
        $('#tabs-3 svg g.uv-hor-axis').find('g.tick text').attr({
            "transform": "rotate(90)",
            "x": 5
        }).css("text-anchor", 'start'); 
    }

    //Report_3 attach Handlers
    var $select = $('#panel-names');
    $("#report3-tracker").on('submit', function(e) {
        e.preventDefault();
        reports3Handler();        
    });

    $select.on('change', function(e){
        drawReport3();    
    }); 

    //init first chart
    reports1Handler();
    activated[0] = true;

});

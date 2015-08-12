var UVChartsUtil = {
    reports_config: {
        graph: {
            bgcolor: 'none',
            custompalette: ['#1a99aa', '#aaa', '#ff5c00']
        },
        dimension: {
            width: 500,
            height: 300
        },
        margin: {
            top: 60,
            bottom: 150,
            left: 100,
            right: 40
        },
        axis: {
            showsubticks: false,
            fontfamily: 'PT Sans'
        },
        meta: {
            caption: 'Candidate results on technolgy wise',
            subcaption: '',
            hlabel: 'Number of cleared rounds',
            vlabel: 'Technologies'
        },
        frame: {
            bgcolor: 'none'
        },
        legend: {
            fontfamily: 'PT Sans'
        },
        effects: {
            textcolor: '#000'
        },

        caption: {
            fontfamily: 'PT Sans'
        },
        subCaption: {
            fontfamily: 'PT Sans'
        }
    }    
};



UVChartsUtil.reports2_config = $.extend(true, {}, UVChartsUtil.reports_config);
UVChartsUtil.reports2_config.meta = {
    caption: 'Interviewer performance results in ratio',
    subcaption: '',
    //hlabel: 'Individual Performance',
    vlabel: 'Ratio'
};
UVChartsUtil.reports2_config.graph.orientation = 'Vertical';
UVChartsUtil.reports2_config.dimension = {
    height: 300
};

UVChartsUtil.reports3_config = $.extend(true, {}, UVChartsUtil.reports_config);



UVChartsUtil.reports3_config = {
    	meta : {
        caption: 'Each interview results',
        subcaption: '',
        hlabel: 'Interview taken date',
        vlabel: 'Overall Recommendation'
    },
    margin : {
        top: 60,
        bottom: 310,
        left: 60,
        right: 40
    },
    graph: {
    	orientation : 'Vertical',
        custompalette: ['#1a99aa', '#aaa', '#ff500']
    },
    dimension: {
        width: 500,
        height: 200
    },
}

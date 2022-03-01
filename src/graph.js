function setup() {
    const graphContainerDOM = document.querySelector('.graph_content .graph')
    let canvas = createCanvas(graphContainerDOM.clientWidth - 40, graphContainerDOM.clientHeight - 40);
    canvas.parent('graph');
}

function draw() {
    const graphContainerDOM = document.querySelector('.graph_content .graph')

    background(22,32,42)
    fill(246,167,94)
    rect(0,(height/2) - 1,width,2);
    const widthB = ((graphContainerDOM.clientWidth - 40)/58)
    for(let i = 0; i <= temperatures.length; i++)
    {
         drawBar(widthB,temperatures[i]*50,i)
    }
}

function windowResized() {
    const graphContainerDOM = document.querySelector('.graph_content .graph')
    resizeCanvas(graphContainerDOM.clientWidth - 40, graphContainerDOM.clientHeight - 40);
}


function drawBar(width,value,count)
{
    noStroke()
    if(value > 0)
    {
        fill(246,167,94)
        rect(count * width,(height/2) - value - 1, width, value);
    }
    else if (value < 0)
    {
        fill(48,70,92)
        rect(count * width,(height/2) - value + 1, width, value);
    }

}
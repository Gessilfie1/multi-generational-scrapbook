(function () {

    /* Manipulating drawing with Text Input */

    /* Canvas Variables */
    const kidId = document.querySelector('#kidId').textContent;

    const generatedCanvas = document.querySelector('#generatedCanvas');
    const generatedCanvasProps = window.getComputedStyle(generatedCanvas); // grabbing rendered values from #generatedCanvas

    const ctx2 = generatedCanvas.getContext('2d');

    let canvasWidth = parseFloat(generatedCanvasProps.width); // currently rendered width
    let canvasHeight = parseFloat(generatedCanvasProps.height); // currently rendered height

    // setting canvas HTML attributes to match currently rendered canvas dimensions
    generatedCanvas.setAttribute('height', ('' + canvasHeight));
    generatedCanvas.setAttribute('width', ('' + canvasWidth));

    let bgColorSelection = 'white';
    let submittedText = "";
    const charLimit = 30;

    let baselineYPos = Math.ceil((canvasHeight / 2) - 3);
    let baselineXPos = canvasWidth / 2;

    let lines = [];
    let currentLine = 0;

    let setNewLine = false;

    // Font Style
    ctx2.font = "bold 24px Arial";

    /* RegEx Font Search */
    let canvasFontSizeRegExp = /\d\dpx/; // TODO: create an expression that accounts for font sizes with differing numbers of digits
    let fontSizeSubstring = ctx2.font.search(canvasFontSizeRegExp);
    let canvasFontSize = parseFloat(ctx2.font.substring(parseFloat(fontSizeSubstring)));

    /* END RegEx Font Search */

    let lineShiftByPx = (parseFloat(canvasFontSize) / 1.8);

    /* Input wiring */

    // Status Text Input

    const textInput = document.querySelector('#inputStatusText');
    const textInputSubmit = document.querySelector('#addStatusText');
    textInputSubmit.addEventListener('click', function () {
        clearLines();
        addText();
        printLines();
    })

    function clearLines() {
        while (lines.length !== 0) {
            lines.pop();
        }
    }

    addBackgroundColor(bgColorSelection);

    function addText() {

        submittedText = textInput.value;
        let numOfLines = 1;

        // Input Display/Word Wrapping

        // calculate numOfLines
        if (submittedText.length > charLimit) { // charLimit currently at 24
            numOfLines = Math.ceil(submittedText.length / charLimit);
        }

        // Word wrapping calculations

        let lineTextCut;
        let startingLineTextTemp;

        for (let i = 0; i < numOfLines; i++) {

            // First line
            if (i === 0) {

                let submittedLineText = submittedText.substring(0, charLimit);
                let lastSpaceIndex = submittedLineText.lastIndexOf(" ");
                let finalLineText;

                if (submittedText.length >= charLimit) {
                    if (lastSpaceIndex !== (charLimit - 1)) {
                        lineTextCut = submittedLineText.substring(lastSpaceIndex + 1, charLimit);
                        finalLineText = submittedLineText.substring(0, lastSpaceIndex);
                    } else {
                        finalLineText = submittedText.substring(0, charLimit);
                    }

                    lines[i] = {
                        text: finalLineText,
                        yPos: baselineYPos,
                    }

                } else {
                    lines[i] = {
                        text: submittedText.substring(0, (submittedText.length)),
                        yPos: baselineYPos,
                    }
                }

                // All other lines

            } else {
                /* Varibles */

                let testSub = submittedText.substring((charLimit * i), (charLimit * (i + 1)));

                if (typeof lineTextCut !== "undefined") {
                    if (testSub.length !== 0 || typeof testSub !== "undefined") {
                        startingLineTextTemp = lineTextCut + submittedText.substring((charLimit * i), (charLimit * (i + 1)));

                    } else {
                        startingLineNextTemp = lineTextCut;
                    }

                } else {
                    startingLineTextTemp = testSub;
                }

                if (startingLineTextTemp.length > charLimit) {
                    lineTextCut = startingLineTextTemp.substring(charLimit);
                } else {
                    lineTextCut = "";
                }

                let submittedLineText = startingLineTextTemp.substring(0, charLimit);
                let lastSpaceIndex = submittedLineText.lastIndexOf(" ");
                let finalLineText;

                /* Wrap Calc */

                // if (lineTextCut.length !== 0) {
                if (lastSpaceIndex !== (charLimit - 1)) {
                    lineTextCut = submittedLineText.substring(lastSpaceIndex + 1, charLimit) + lineTextCut;

                    finalLineText = submittedLineText.substring(0, lastSpaceIndex);
                } else {
                    finalLineText = submittedLineText;
                }

                /* Line yPos shifting/creation */

                // shifting lines before creating new line in lines[] array
                // previous line yPos shift
                for (let j = 0; j < lines.length; j++) {
                    lines[j].yPos -= lineShiftByPx;
                }

                // Line Creation

                let newLineYPos = baselineYPos + (lineShiftByPx * lines.length);

                lines[i] = {
                    text: finalLineText,
                    yPos: newLineYPos,

                }

                // Final Line Creation

                let nextLine = submittedText.substring((charLimit * (i + 1)), (charLimit * (i + 2)));

                if ((typeof lineTextCut !== "undefined") || (lineTextCut.length > 0)) {

                    if (nextLine.length === 0) {

                        if (lines[i].text.length + lineTextCut.length < charLimit) {
                            lines[i].text += ' ' + lineTextCut;
                        } else {
                            for (let j = 0; j < lines.length; j++) {
                                lines[j].yPos -= lineShiftByPx;

                            }
                            newLineYPos = baselineYPos + (lineShiftByPx * lines.length);
                            lines[i + 1] = {
                                text: lineTextCut,
                                yPos: newLineYPos,
                            }
                        }
                        break;
                    }
                    else {
                        numOfLines += 1;
                    }
                }
            }
        }

        /* Start Render */

        ctx2.clearRect(0, 0, canvasWidth, canvasHeight); // clears canvas for next render

        addBackgroundColor(bgColorSelection);

    }

    function printLines() {
        // print all lines
        for (let x = 0; x < lines.length; x++) {
            ctx2.textAlign = "center";
            ctx2.textBaseline = "middle";
            ctx2.fillText(lines[x].text, baselineXPos, lines[x].yPos);
        }
    }

    // Background Color Input

    const backgroundColorInputForm = document.querySelector('#backgroundColorInputForm');

    backgroundColorInputForm.addEventListener("click", function () {
        let bgColorData = new FormData(backgroundColorInputForm);

        for (const entry of bgColorData) {
            bgColorSelection = entry[1];
        };

        addBackgroundColor(bgColorSelection);
        printLines();
    })

    function addBackgroundColor(color) {

        /* TODO: Add other color settings */
        let grd = ctx2.createLinearGradient(0, 0, 0, canvasHeight);
        if (color === "black") {
            grd.addColorStop(0, '#555');
            grd.addColorStop(0.3, 'black');
            grd.addColorStop(0.7, 'black');
            grd.addColorStop(1, '#555');

            ctx2.fillStyle = grd; // changing color of the next "drawing method"
            ctx2.fillRect(0, 0, canvasWidth, canvasHeight); // pixel start coordinates/size of drawing INSIDE canvas

            ctx2.fillStyle = 'white'; // text color

        } else if (color === "white") {
            grd.addColorStop(0, '#bbb');
            grd.addColorStop(0.3, 'white');
            grd.addColorStop(0.7, 'white');
            grd.addColorStop(1, '#bbb');

            ctx2.fillStyle = grd; // changing color of the next "drawing method"
            ctx2.fillRect(0, 0, canvasWidth, canvasHeight); // pixel start coordinates/size of drawing INSIDE canvas

            ctx2.fillStyle = 'black'; // text color

        } else if (color === "red") {
            grd.addColorStop(0, '#a10808');
            grd.addColorStop(0.3, '#e00c0c');
            grd.addColorStop(0.7, '#e00c0c');
            grd.addColorStop(1, '#a10808');

            ctx2.fillStyle = grd; // changing color of the next "drawing method"
            ctx2.fillRect(0, 0, canvasWidth, canvasHeight); // pixel start coordinates/size of drawing INSIDE canvas

            ctx2.fillStyle = 'white'; // text color

        } else if (color === "orange") {
            grd.addColorStop(0, '#b55802');
            grd.addColorStop(0.3, '#f57803');
            grd.addColorStop(0.7, '#f57803');
            grd.addColorStop(1, '#b55802');

            ctx2.fillStyle = grd; // changing color of the next "drawing method"
            ctx2.fillRect(0, 0, canvasWidth, canvasHeight); // pixel start coordinates/size of drawing INSIDE canvas

            ctx2.fillStyle = 'white'; // text color

        } else if (color === "yellow") {
            grd.addColorStop(0, '#bcbf00');
            grd.addColorStop(0.3, '#fbff00');
            grd.addColorStop(0.7, '#fbff00');
            grd.addColorStop(1, '#bcbf00');

            ctx2.fillStyle = grd; // changing color of the next "drawing method"
            ctx2.fillRect(0, 0, canvasWidth, canvasHeight); // pixel start coordinates/size of drawing INSIDE canvas

            ctx2.fillStyle = 'black'; // text color

        } else if (color === "green") {
            grd.addColorStop(0, '#478f04');
            grd.addColorStop(0.3, '#66ce06');
            grd.addColorStop(0.7, '#66ce06');
            grd.addColorStop(1, '#478f04');

            ctx2.fillStyle = grd; // changing color of the next "drawing method"
            ctx2.fillRect(0, 0, canvasWidth, canvasHeight); // pixel start coordinates/size of drawing INSIDE canvas

            ctx2.fillStyle = 'white'; // text color

        } else if (color === "blue") {
            grd.addColorStop(0, '#141a75');
            grd.addColorStop(0.3, '#1f29b6');
            grd.addColorStop(0.7, '#1f29b6');
            grd.addColorStop(1, '#141a75');

            ctx2.fillStyle = grd; // changing color of the next "drawing method"
            ctx2.fillRect(0, 0, canvasWidth, canvasHeight); // pixel start coordinates/size of drawing INSIDE canvas

            ctx2.fillStyle = 'white'; // text color

        } else if (color === "purple") {
            grd.addColorStop(0, '#681973');
            grd.addColorStop(0.3, '#a227b3');
            grd.addColorStop(0.7, '#a227b3');
            grd.addColorStop(1, '#681973');

            ctx2.fillStyle = grd; // changing color of the next "drawing method"
            ctx2.fillRect(0, 0, canvasWidth, canvasHeight); // pixel start coordinates/size of drawing INSIDE canvas

            ctx2.fillStyle = 'white'; // text color

        }

    }

    /* Status update canvas image submission */

    const statusSubmitButton = document.querySelector('#submitStatus');
    statusSubmitButton.addEventListener('click', function () {

        // Currently successfully posts multiple updates.
        // All updates currently point to the same image file, however. May fix itself once we generate multiple file names.

        generatedCanvas.toBlob(canvasBlob => {

            const formData = new FormData();

            formData.append("caption", ""); // assigning @RequestParam key / value pairs
            formData.append("kidId", kidId);

            formData.append("file", canvasBlob);

            const request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    window.location.href = '/kid?id=' + kidId;
                };
            };
            request.open('POST', '/uploadStatus'); // opens POST request to /uploadImage for upload processing
            request.send(formData); // sends RequestParams and image file itself

        });
    })

})();
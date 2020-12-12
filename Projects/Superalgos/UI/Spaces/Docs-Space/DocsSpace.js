function newSuperalgosDocSpace() {
    const MODULE_NAME = 'Doc Space'
    let thisObject = {
        sidePanelTab: undefined,
        container: undefined,
        navigateTo: navigateTo,
        scrollToElement: scrollToElement, 
        physics: physics,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize,
        finalize: finalize
    }

    let isInitialized = false

    thisObject.container = newContainer()
    thisObject.container.name = MODULE_NAME
    thisObject.container.initialize()
    thisObject.container.isClickeable = true
    thisObject.container.isDraggeable = false
    thisObject.container.detectMouseOver = true
    thisObject.container.status = 'hidden'

    resize()

    let browserResizedEventSubscriptionId
    let openingEventSubscriptionId
    let closingEventSubscriptionId

    let textArea
    let selectedParagraph
    let selectedParagraphData = ''
    let selectedParagraphHeight = 0
    let objectBeingRendered
    let docSchemaParagraphMap
    let nodeAppDefinition
    let nodeDocsDefinition
    let menuLabelsMap = new Map()

    return thisObject

    function initialize() {
        thisObject.sidePanelTab = newSidePanelTab()
        thisObject.sidePanelTab.container.connectToParent(thisObject.container, false, false)
        thisObject.sidePanelTab.initialize('right')
        openingEventSubscriptionId = thisObject.sidePanelTab.container.eventHandler.listenToEvent('opening', onOpening)
        closingEventSubscriptionId = thisObject.sidePanelTab.container.eventHandler.listenToEvent('closing', onClosing)

        browserResizedEventSubscriptionId = canvas.eventHandler.listenToEvent('Browser Resized', resize)
        setUpContextMenu()
        setUpMenuItemsMap()
        isInitialized = true

        function setUpContextMenu() {
            window.contextMenu = {
                editParagraph: editParagraph,
                toJavascript: toJavascript,
                toJson: toJson,
                toText: toText,
                toTitle: toTitle,
                toSubtitle: toSubtitle,
                toNote: toNote,
                toWarning: toWarning,
                toImportant: toImportant,
                toSuccess: toSuccess,
                toList: toList
            }

            function editParagraph() {
                contextMenuForceOutClick()
                showHTMLTextArea()

                function showHTMLTextArea() {
                    if (selectedParagraph === undefined) { return }

                    let extraClassName = ''
                    if (selectedParagraph.id.indexOf('definition') >= 0) {
                        extraClassName = ' ' + ''
                    }
                    if (selectedParagraph.id.indexOf('title') >= 0) {
                        extraClassName = ' ' + 'docs-h3'
                    }
                    if (selectedParagraph.id.indexOf('subtitle') >= 0) {
                        extraClassName = ' ' + 'docs-h4'
                    }
                    if (selectedParagraph.id.indexOf('note') >= 0) {
                        extraClassName = ' ' + 'docs-alert-note'
                    }
                    if (selectedParagraph.id.indexOf('success') >= 0) {
                        extraClassName = ' ' + 'docs-alert-success'
                    }
                    if (selectedParagraph.id.indexOf('important') >= 0) {
                        extraClassName = ' ' + 'docs-alert-important'
                    }
                    if (selectedParagraph.id.indexOf('warning') >= 0) {
                        extraClassName = ' ' + 'docs-alert-warning'
                    }
                    if (selectedParagraph.id.indexOf('javascript') >= 0) {
                        extraClassName = ' ' + 'language-javascript'
                    }
                    if (selectedParagraph.id.indexOf('json') >= 0) {
                        extraClassName = ' ' + 'language-json'
                    }

                    textArea = document.createElement('textarea');
                    textArea.id = "textArea";
                    textArea.spellcheck = false;
                    textArea.className = "docs-text-area" + extraClassName
                    textArea.style.height = selectedParagraphHeight
                    textArea.value = selectedParagraphData
                    selectedParagraph.innerHTML = ""
                    selectedParagraph.appendChild(textArea)
                    textArea.style.display = 'block'
                    textArea.focus()
                    contextMenuForceOutClick()
                    enterEditMode()
                }
            }

            function toJavascript() {
                let docSchemaParagraph = docSchemaParagraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Javascript'
                renderPage()
            }

            function toJson() {
                let docSchemaParagraph = docSchemaParagraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Json'
                renderPage()
            }

            function toText() {
                let docSchemaParagraph = docSchemaParagraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Text'
                renderPage()
            }

            function toTitle() {
                let docSchemaParagraph = docSchemaParagraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Title'
                renderPage()
            }

            function toSubtitle() {
                let docSchemaParagraph = docSchemaParagraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Subtitle'
                renderPage()
            }

            function toNote() {
                let docSchemaParagraph = docSchemaParagraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Note'
                renderPage()
            }

            function toWarning() {
                let docSchemaParagraph = docSchemaParagraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Warning'
                renderPage()
            }

            function toImportant() {
                let docSchemaParagraph = docSchemaParagraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Important'
                renderPage()
            }

            function toSuccess() {
                let docSchemaParagraph = docSchemaParagraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Success'
                renderPage()
            }

            function toList() {
                let docSchemaParagraph = docSchemaParagraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'List'
                renderPage()
            }
        }

        function setUpMenuItemsMap() {
            /*
            Here we will put put all the menu item labels of all nodes at all
            app schemas into a single map, that will allow us to know when a phrase
            is a label of a menu and then change its style.
            */
            for (let i = 0; i < PROJECTS_ARRAY.length; i++) {
                let project = PROJECTS_ARRAY[i]
                let appSchemaArray = SCHEMAS_BY_PROJECT.get(project).array.appSchema

                for (let j = 0; j < appSchemaArray.length; j++) {
                    let nodeDefinition = appSchemaArray[j]

                    if (nodeDefinition.menuItems === undefined) { continue }
                    for (let k = 0; k < nodeDefinition.menuItems.length; k++) {
                        let menuItem = nodeDefinition.menuItems[k]
                        menuLabelsMap.set(menuItem.label, true)
                    }
                }
            }
        }
    }

    function finalize() {
        canvas.eventHandler.stopListening(browserResizedEventSubscriptionId)
        thisObject.sidePanelTab.container.eventHandler.stopListening(openingEventSubscriptionId)
        thisObject.sidePanelTab.container.eventHandler.stopListening(closingEventSubscriptionId)

        objectBeingRendered = undefined
        docSchemaParagraphMap = undefined
        nodeAppDefinition = undefined
        nodeDocsDefinition = undefined
        menuLabelsMap = undefined
    }

    function onKeyDown(event) {
        /* 
        When an editor is on focus we will only
        take care of a few combinations of key strokes
        so as to tell the editor container when the user
        would like to close the editor.
        */
        if (event.key === 'Escape') {
            exitEditMode()
        }
    }

    function enterEditMode() {
        EDITOR_ON_FOCUS = true
        window.editorController = {
            onKeyDown: onKeyDown
        }
    }

    function exitEditMode() {
        if (EDITOR_ON_FOCUS === true) {
            let editing
            if (selectedParagraph.id.indexOf('definition') >= 0) {
                editing = "Definition"
            } else {
                editing = "Paragraph"
            }
            switch (editing) {
                case "Paragraph": {
                    /*
                    In this case we are at a regular paragraph.
                    */
                    let docSchemaParagraph = docSchemaParagraphMap.get(selectedParagraph.id)
                    /*
                    We will detect if the user has created new paragraphs while editing.
                    For that we will inspect the value of the text area looking for a char
                    code representing carriedge return.
                    */
                    let paragraphs = []
                    let paragraph = ''
                    let splittedSelectedParagraph = selectedParagraph.id.split('-')
                    let selectedParagraphIndex = Number(splittedSelectedParagraph[1])
                    let selectedParagraphStyle = splittedSelectedParagraph[2]
                    let style = selectedParagraphStyle.charAt(0).toUpperCase() + selectedParagraphStyle.slice(1);

                    for (let i = 0; i < textArea.value.length; i++) {
                        if (textArea.value.charCodeAt(i) === 10 && style !== 'Javascript' && style !== 'Json') {
                            if (paragraph !== '') {
                                paragraphs.push(paragraph)
                            }
                            paragraph = ''
                        } else {
                            paragraph = paragraph + textArea.value[i]
                        }
                    }
                    paragraphs.push(paragraph)

                    if (paragraphs.length === 1) {
                        /* There is no need to add new paragraphs, we just update the one we have. */
                        if (paragraphs[0] !== '') {
                            docSchemaParagraph.text = paragraphs[0]
                        } else {
                            nodeDocsDefinition.paragraphs.splice(selectedParagraphIndex, 1)
                            if (nodeDocsDefinition.paragraphs.length === 0) {
                                let newParagraph = {
                                    style: 'Text',
                                    text: 'Please contribute to the docs by editing this content.'
                                }
                                nodeDocsDefinition.paragraphs.push(newParagraph)
                            }
                        }
                    } else {
                        /*
                        We will update the one paragraph we have and we will add the rest. 
                        */
                        docSchemaParagraph.text = paragraphs[0]

                        for (let i = 1; i < paragraphs.length; i++) {
                            let newParagraph = {
                                style: style,
                                text: paragraphs[i]
                            }
                            nodeDocsDefinition.paragraphs.splice(selectedParagraphIndex + i, 0, newParagraph)
                        }
                    }

                    break
                }
                case "Definition": {
                    /*
                    This means that the definition was being edited.
                    */
                    if (textArea.value !== '') {
                        nodeDocsDefinition.definition = textArea.value
                    }
                    break
                }
            }
            EDITOR_ON_FOCUS = false
            renderPage()
        }
    }

    function contextMenuActivateRightClick() {
        const contextMenuClickablDiv = document.getElementById('docs-context-menu-clickeable-div')
        const menu = document.getElementById('menu')
        const outClick = document.getElementById('docs-space-div')

        contextMenuClickablDiv.addEventListener('contextmenu', e => {
            e.preventDefault()
            if (EDITOR_ON_FOCUS === true) {
                exitEditMode()
                return
            }
            if (contextMenuGetSelection() === false) {
                /*
                The click was in a place where we can not recognize an editable piece.
                We will not open the menu in this circunstances.
                */
                return
            }

            menu.style.top = `${e.clientY}px`
            menu.style.left = `${e.clientX}px`
            menu.classList.add('show')

            outClick.style.display = "block"
        })

        outClick.addEventListener('click', () => {
            contextMenuForceOutClick()
        })
    }

    function contextMenuForceOutClick() {
        const outClick = document.getElementById('docs-space-div')
        const menu = document.getElementById('menu')
        menu.classList.remove('show')
        outClick.style.display = "none"
    }

    function contextMenuGetSelection() {
        let selection = window.getSelection()

        /* 
        We need to locate the parent node that it is a Paragraph,
        otherwise we could end up in an inner html element.
        */
        let paragraphNode = selection.baseNode

        if (paragraphNode.id !== undefined && paragraphNode.parentNode.className === "docs-tooltip") {
            return false
        }

        if (paragraphNode.id === undefined || paragraphNode.id.indexOf('paragraph') < 0) {
            paragraphNode = paragraphNode.parentNode
        }
        if (paragraphNode.id === undefined || paragraphNode.id.indexOf('paragraph') < 0) {
            paragraphNode = paragraphNode.parentNode
        }
        if (paragraphNode.id === undefined || paragraphNode.id.indexOf('paragraph') < 0) {
            paragraphNode = paragraphNode.parentNode
        }
        if (paragraphNode.id === undefined || paragraphNode.id.indexOf('paragraph') < 0) {
            paragraphNode = paragraphNode.parentNode
        }
        if (paragraphNode.id === undefined || paragraphNode.id.indexOf('paragraph') < 0) {
            return false
        }

        /*
        Depending on the Style of Paragraph we will need to remove
        some info from the innerText. 
        */
        if (paragraphNode.id.indexOf('definition') >= 0) {
            selectedParagraphData = paragraphNode.innerText
        }
        if (paragraphNode.id.indexOf('text') >= 0) {
            selectedParagraphData = paragraphNode.innerText
        }
        if (paragraphNode.id.indexOf('title') >= 0) {
            selectedParagraphData = paragraphNode.innerText
        }
        if (paragraphNode.id.indexOf('subtitle') >= 0) {
            selectedParagraphData = paragraphNode.innerText
        }
        if (paragraphNode.id.indexOf('note') >= 0) {
            selectedParagraphData = paragraphNode.innerText.substring(6, paragraphNode.innerText.length)
        }
        if (paragraphNode.id.indexOf('success') >= 0) {
            selectedParagraphData = paragraphNode.innerText.substring(5, paragraphNode.innerText.length)
        }
        if (paragraphNode.id.indexOf('important') >= 0) {
            selectedParagraphData = paragraphNode.innerText.substring(11, paragraphNode.innerText.length)
        }
        if (paragraphNode.id.indexOf('warning') >= 0) {
            selectedParagraphData = paragraphNode.innerText.substring(10, paragraphNode.innerText.length)
        }
        if (paragraphNode.id.indexOf('list') >= 0) {
            selectedParagraphData = paragraphNode.innerText
        }
        if (paragraphNode.id.indexOf('javascript') >= 0) {
            selectedParagraphData = paragraphNode.innerText.substring(1, paragraphNode.innerText.length - 1)
        }
        if (paragraphNode.id.indexOf('json') >= 0) {
            selectedParagraphData = paragraphNode.innerText.substring(1, paragraphNode.innerText.length - 1)
        }

        selectedParagraph = paragraphNode
        selectedParagraphHeight = paragraphNode.getClientRects()[0].height
        return true
    }

    function onOpening() {

    }

    function onClosing() {

    }

    function scrollToElement(htmlElementId) {
        let myElement = document.getElementById(htmlElementId)
        let topPos = myElement.offsetTop
        let scrollingDiv = document.getElementById('docs-space-div')
        scrollingDiv.scrollTop = topPos
    }

    function navigateTo(category, type, project) {

        docSchemaParagraphMap = new Map()
        objectBeingRendered = {
            category: category,
            type: type,
            project: project
        }

        renderPage()
        scrollToElement('docs-context-menu-clickeable-div')
    }

    function renderPage() {

        nodeAppDefinition = SCHEMAS_BY_PROJECT.get(objectBeingRendered.project).map.appSchema.get(objectBeingRendered.type)
        nodeDocsDefinition = SCHEMAS_BY_PROJECT.get(objectBeingRendered.project).map.docSchema.get(objectBeingRendered.type)

        if (nodeDocsDefinition === undefined) {
            // Use the New Node Template
            return
        }
        buildNodeHtmlPage()
        contextMenuActivateRightClick()

        function buildNodeHtmlPage() {
            let HTML = ''

            HTML = HTML + '<div id="docs-context-menu-clickeable-div" class="docs-node-html-page-container">' // Container Starts

            /* Title */
            HTML = HTML + '<div id="docs-main-title-div"><table class="docs-title-table"><tr><td width="50px"><div id="projectImageDiv" class="docs-image-container"/></td><td><h2 class="docs-h2" id="' + objectBeingRendered.type.toLowerCase().replace(' ', '-') + '" > ' + objectBeingRendered.project + ' / ' + objectBeingRendered.type + '</h2></td></tr></table></div>'

            /* We start with the Definition Table */
            if (nodeDocsDefinition.definition !== undefined) {
                HTML = HTML + '<table class="docs-definition-table">'
                HTML = HTML + '<tr>'
                HTML = HTML + '<td width=150px>'
                HTML = HTML + '<div id="definitionImageDiv" class="docs-image-container"/>'
                HTML = HTML + '</td>'
                HTML = HTML + '<td>'
                HTML = HTML + '<div id="definition-paragraph" class="docs-normal-font"><strong>' + addToolTips(nodeDocsDefinition.definition) + '</strong></div>'
                HTML = HTML + '</td>'
                HTML = HTML + '</tr>'
                HTML = HTML + '</table>'
            }

            HTML = HTML + '<div id="docs-content">'

            if (nodeDocsDefinition.paragraphs !== undefined) {
                for (let i = 0; i < nodeDocsDefinition.paragraphs.length; i++) {
                    let paragraph = nodeDocsDefinition.paragraphs[i]
                    let innerHTML = addToolTips(paragraph.text)
                    let styleClass = ''
                    let prefix = ''
                    let sufix = ''
                    let role = ''
                    let key = 'paragraph-' + i

                    switch (paragraph.style) {
                        case 'Text': {
                            styleClass = ''
                            prefix = ''
                            role = ''
                            key = key + '-text'
                            innerHTML = addBold(paragraph.text)
                            innerHTML = addItalics(innerHTML)
                            innerHTML = addToolTips(innerHTML)
                            break
                        }
                        case 'Title': {
                            styleClass = 'class="docs-h3"'
                            prefix = ''
                            role = ''
                            key = key + '-title'
                            innerHTML = paragraph.text
                            break
                        }
                        case 'Subtitle': {
                            styleClass = 'class="docs-h4"'
                            prefix = ''
                            role = ''
                            key = key + '-subtitle'
                            innerHTML = paragraph.text
                            break
                        }
                        case 'Note': {
                            styleClass = 'class="docs-font-small docs-alert-note"'
                            prefix = '<i class="docs-fa docs-note-circle"></i> <b>Note:</b>'
                            role = 'role="alert"'
                            key = key + '-note'
                            innerHTML = addItalics(innerHTML)
                            innerHTML = addToolTips(innerHTML)
                            break
                        }
                        case 'Success': {
                            styleClass = 'class="docs-font-small docs-alert-success"'
                            prefix = '<i class="docs-fa docs-check-square-o"></i> <b>Tip:</b>'
                            role = 'role="alert"'
                            key = key + '-success'
                            innerHTML = addItalics(innerHTML)
                            innerHTML = addToolTips(innerHTML)
                            break
                        }
                        case 'Important': {
                            styleClass = 'class="docs-font-small docs-alert-important"'
                            prefix = '<i class="docs-fa docs-warning-sign"></i> <b>Important:</b>'
                            role = 'role="alert"'
                            key = key + '-important'
                            innerHTML = addItalics(innerHTML)
                            innerHTML = addToolTips(innerHTML)
                            break
                        }
                        case 'Warning': {
                            styleClass = 'class="docs-font-small docs-alert-warning"'
                            prefix = '<i class="docs-fa docs-warning-sign"></i> <b>Warning:</b>'
                            role = 'role="alert"'
                            key = key + '-warning'
                            innerHTML = addItalics(innerHTML)
                            innerHTML = addToolTips(innerHTML)
                            break
                        }
                        case 'List': {
                            styleClass = ''
                            prefix = '<li>'
                            sufix = '</li>'
                            role = ''
                            key = key + '-list'
                            innerHTML = addBold(paragraph.text)
                            innerHTML = addItalics(innerHTML)
                            innerHTML = addToolTips(innerHTML)
                            break
                        }
                        case 'Javascript': {
                            styleClass = ''
                            prefix = '<pre><code class="language-javascript">'
                            sufix = '</code></pre>'
                            role = ''
                            key = key + '-javascript'
                            innerHTML = paragraph.text
                            break
                        }
                        case 'Json': {
                            styleClass = ''
                            prefix = '<pre><code class="language-json">'
                            sufix = '</code></pre>'
                            role = ''
                            key = key + '-json'
                            innerHTML = paragraph.text
                            break
                        }
                    }

                    HTML = HTML + '<p><div id="' + key + '" ' + styleClass + ' ' + role + '>' + prefix + ' ' + innerHTML + sufix + '</div></p>'
                    docSchemaParagraphMap.set(key, paragraph)
                }
            }

            HTML = HTML + '</div>' // Content Ends

            HTML = HTML + '</div>' // Container Ends

            let docsAppDiv = document.getElementById('docs-space-div')
            docsAppDiv.innerHTML = HTML + addFooter()
            _self.Prism.highlightAllUnder(docsAppDiv, true, onHighlighted)

            function onHighlighted() {
                // nothing to do here
            }

            addProjectImage(project)

            if (nodeDocsDefinition.definition !== undefined) {
                addDefinitionImage(nodeAppDefinition, objectBeingRendered.project)
            }

            function addFooter() {
                let HTML = ''

                HTML = HTML + '<div class="docs-node-html-footer-container">' // Container Starts

                HTML = HTML + '<hr class="docs-shaded"></hr>'
                HTML = HTML + '<footer>'
                HTML = HTML + '<div class="docs-footer-row">'
                HTML = HTML + '<div class="docs-footer-body" style="text-align: left;">'

                HTML = HTML + '<div onClick="UI.projects.superalgos.spaces.docsSpace.scrollToElement(\'docs-main-title-div\')" class="docs-plain-link"><kbd class=docs-kbd>BACK TO TOP ↑</kbd></div>'

                HTML = HTML + '<ul>'
                HTML = HTML + '<li><a href="https://superalgos.org/" target="_blank" class="docs-footer-link">Superalgos Project</a> — Learn more about the project.</li>'
                HTML = HTML + '<li><a href="https://t.me/superalgoscommunity" rel="nofollow" target="_blank" class="docs-footer-link">Community Group</a> — Lets talk Superalgos!</li>'
                HTML = HTML + '<li><a href="https://t.me/superalgossupport" rel="nofollow" target="_blank" class="docs-footer-link">Support Group</a> — Need help using the <code class="docs-code">master</code> branch?</li>'
                HTML = HTML + '<li><a href="https://t.me/superalgosdevelop" rel="nofollow" target="_blank" class="docs-footer-link">Develop Group</a> — Come test the <code class="docs-code">develop</code> branch!</li>'
                HTML = HTML + '<li><a href="https://t.me/superalgosuxui" rel="nofollow" target="_blank" class="docs-footer-link">UX/UI Design Group</a> — Help us improve the GIU!</li>'
                HTML = HTML + '<li><a href="https://t.me/superalgos_es" rel="nofollow" target="_blank" class="docs-footer-link">Grupo en Español</a> — Hablemos en español!</li>'
                HTML = HTML + '<li><a href="https://t.me/superalgos" rel="nofollow" target="_blank" class="docs-footer-link">Superalgos Announcements</a> — Be the first to know about new releases, hotfixes, and important issues.</li>'
                HTML = HTML + '</ul>'
                HTML = HTML + '<img src="Images/superalgos-logo.png" width="200 px">'

                HTML = HTML + '</div>'
                HTML = HTML + '</div>'
                HTML = HTML + '</footer>'

                HTML = HTML + '</div>' // Container Ends

                return HTML
            }
        }

        thisObject.sidePanelTab.open()
    }

    function addDefinitionImage(nodeAppDefinition, project) {
        if (nodeAppDefinition.icon === undefined) {
            imageName = nodeAppDefinition.type.toLowerCase().replace(' ', '-').replace(' ', '-').replace(' ', '-').replace(' ', '-').replace(' ', '-')
        }
        let htmlImage = document.createElement("IMG")
        let webParam = 'Icons/' + project + '/' + imageName + '.png'

        htmlImage.src = webParam
        htmlImage.width = "150"
        htmlImage.height = "150"

        let definitionImageDiv = document.getElementById('definitionImageDiv')
        definitionImageDiv.appendChild(htmlImage)
    }

    function addProjectImage(project) {
        imageName = project.toLowerCase().replace(' ', '-').replace(' ', '-').replace(' ', '-').replace(' ', '-').replace(' ', '-')

        let htmlImage = document.createElement("IMG")
        let webParam = 'Icons/' + project + '/' + imageName + '.png'

        htmlImage.src = webParam
        htmlImage.width = "50"
        htmlImage.height = "50"

        let projectImageDiv = document.getElementById('projectImageDiv')
        projectImageDiv.appendChild(htmlImage)
    }

    function addBold(text) {
        let splittedText = text.split(':')
        if (splittedText.length > 1 && splittedText[1].length > 0) {
            return '<b>' + splittedText[0] + ':' + '</b>' + splittedText[1]
        } else {
            return text
        }
    }

    function addItalics(text) {

        let words = text.split(' ')
        let changedText = ''
        for (let i = 0; i < words.length; i++) {
            let phrase1 = words[i]
            let phrase2 = words[i] + ' ' + words[i + 1]
            let phrase3 = words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]
            let phrase4 = words[i] + ' ' + words[i + 1] + ' ' + words[i + 2] + ' ' + words[i + 3]

            let cleanPhrase1 = cleanPhrase(phrase1)
            let cleanPhrase2 = cleanPhrase(phrase2)
            let cleanPhrase3 = cleanPhrase(phrase3)
            let cleanPhrase4 = cleanPhrase(phrase4)

            let found = false

            if (found === false && menuLabelsMap.get(cleanPhrase4) === true) {
                changedText = changedText + phrase4.replace(cleanPhrase4, '<i>' + cleanPhrase4 + '</i>') + ' '
                i = i + 3
                found = true
            }

            if (found === false && menuLabelsMap.get(cleanPhrase3) === true) {
                changedText = changedText + phrase4.replace(cleanPhrase3, '<i>' + cleanPhrase3 + '</i>') + ' '
                i = i + 2
                found = true
            }

            if (found === false && menuLabelsMap.get(cleanPhrase2) === true) {
                changedText = changedText + phrase4.replace(cleanPhrase2, '<i>' + cleanPhrase2 + '</i>') + ' '
                i = i + 1
                found = true
            }

            if (found === false && menuLabelsMap.get(cleanPhrase1) === true) {
                changedText = changedText + phrase4.replace(cleanPhrase1, '<i>' + cleanPhrase1 + '</i>') + ' '
                i = i + 0
                found = true
            }

            if (found === false) {
                changedText = changedText + phrase1 + ' '
            }
        }
        return changedText
    }

    function addToolTips(text) {

        const TOOL_TIP_HTML = '<div onClick="UI.projects.superalgos.spaces.docsSpace.navigateTo(\'CATEGORY\', \'TYPE\', \'PROJECT\')" class="docs-tooltip">TYPE_LABEL<span class="docs-tooltiptext">DEFINITION</span></div>'
        let resultingText = ''
        text = tagNodesAndConceptTypes(text, objectBeingRendered.type)
        let splittedText = text.split('->')

        for (let i = 0; i < splittedText.length; i = i + 2) {
            let firstPart = splittedText[i]
            let taggedText = splittedText[i + 1]

            if (taggedText === undefined) {
                return resultingText + firstPart
            }

            let splittedTaggedText = taggedText.split('|')
            let category = splittedTaggedText[0]
            let type = splittedTaggedText[1]
            let project = splittedTaggedText[2]

            /*
            We will search across all DOC and CONCEPT SCHEMAS
            */
            let found = false
            let definitionNode

            for (let j = 0; j < PROJECTS_ARRAY.length; j++) {
                let project = PROJECTS_ARRAY[j]
                definitionNode = SCHEMAS_BY_PROJECT.get(project).map.docSchema.get(type)
                if (definitionNode !== undefined) {
                    found = true
                    break
                }
                definitionNode = SCHEMAS_BY_PROJECT.get(project).map.conceptSchema.get(type)
                if (definitionNode !== undefined) {
                    found = true
                    break
                }
            }
            if (found === false) {
                return text
            }

            let definition = definitionNode.definition
            if (definition === undefined || definition === "") {
                resultingText = resultingText + firstPart + type
            } else {
                let tooltip = TOOL_TIP_HTML
                .replace('CATEGORY', category)
                .replace('TYPE', type)
                .replace('PROJECT', project)
                .replace('TYPE_LABEL', type)
                .replace('DEFINITION', definition)
                                
                resultingText = resultingText + firstPart + tooltip
            }
        }
        return resultingText
    }

    function tagNodesAndConceptTypes(text, excludeNodesAndConceptTypes) {
        let words = text.split(' ')
        let taggedText = ''
        for (let i = 0; i < words.length; i++) {
            let phrase1 = words[i]
            let phrase2 = words[i] + ' ' + words[i + 1]
            let phrase3 = words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]
            let phrase4 = words[i] + ' ' + words[i + 1] + ' ' + words[i + 2] + ' ' + words[i + 3]

            let cleanPhrase1 = cleanPhrase(phrase1)
            let cleanPhrase2 = cleanPhrase(phrase2)
            let cleanPhrase3 = cleanPhrase(phrase3)
            let cleanPhrase4 = cleanPhrase(phrase4)

            let found = false

            for (let j = 0; j < PROJECTS_ARRAY.length; j++) {
                let project = PROJECTS_ARRAY[j]

                /* Search in docSchema */
                if (SCHEMAS_BY_PROJECT.get(project).map.docSchema.get(cleanPhrase4) !== undefined && cleanPhrase4 !== excludeNodesAndConceptTypes) {
                    taggedText = taggedText + phrase4.replace(cleanPhrase4, '->' + 'Node' + '|' +  cleanPhrase4 + '|' + project + '->') + ' '
                    i = i + 3
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.docSchema.get(cleanPhrase3) !== undefined && cleanPhrase3 !== excludeNodesAndConceptTypes) {
                    taggedText = taggedText + phrase3.replace(cleanPhrase3, '->' + 'Node' + '|' +  cleanPhrase3 + '|' + project + '->') + ' '
                    i = i + 2
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.docSchema.get(cleanPhrase2) !== undefined && cleanPhrase2 !== excludeNodesAndConceptTypes) {
                    taggedText = taggedText + phrase2.replace(cleanPhrase2, '->' + 'Node' + '|' +  cleanPhrase2 + '|' + project + '->') + ' '
                    i = i + 1
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.docSchema.get(cleanPhrase1) !== undefined && cleanPhrase1 !== excludeNodesAndConceptTypes) {
                    taggedText = taggedText + phrase1.replace(cleanPhrase1, '->' + 'Node' + '|' +  cleanPhrase1 + '|' + project + '->') + ' '
                    found = true
                    break
                }

                /* Search in conceptSchema */
                if (SCHEMAS_BY_PROJECT.get(project).map.conceptSchema.get(cleanPhrase4) !== undefined && cleanPhrase4 !== excludeNodesAndConceptTypes) {
                    taggedText = taggedText + phrase4.replace(cleanPhrase4, '->' + 'Concept' + '|' +  cleanPhrase4 + '|' + project + '->') + ' '
                    i = i + 3
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.conceptSchema.get(cleanPhrase3) !== undefined && cleanPhrase3 !== excludeNodesAndConceptTypes) {
                    taggedText = taggedText + phrase3.replace(cleanPhrase3, '->' + 'Concept' + '|' +  cleanPhrase3 + '|' + project + '->') + ' '
                    i = i + 2
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.conceptSchema.get(cleanPhrase2) !== undefined && cleanPhrase2 !== excludeNodesAndConceptTypes) {
                    taggedText = taggedText + phrase2.replace(cleanPhrase2, '->' + 'Concept' + '|' +  cleanPhrase2 + '|' + project + '->') + ' '
                    i = i + 1
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.conceptSchema.get(cleanPhrase1) !== undefined && cleanPhrase1 !== excludeNodesAndConceptTypes) {
                    taggedText = taggedText + phrase1.replace(cleanPhrase1, '->' + 'Concept' + '|' +  cleanPhrase1 + '|' + project + '->') + ' '
                    found = true
                    break
                }
            }

            if (found === false) {
                taggedText = taggedText + phrase1 + ' '
            }
        }
        return taggedText
    }

    function cleanPhrase(phrase) {
        return phrase.replace(',', '')
            .replace(';', '')
            .replace('(', '')
            .replace(')', '')
            .replace('-', '')
            .replace('_', '')
            .replace('.', '')
            .replace('[', '')
            .replace(']', '')
            .replace('{', '')
            .replace('}', '')
            .replace('/', '')
            .replace('>', '')
            .replace('<', '')
    }

    function resize() {
        thisObject.container.frame.width = 800
        thisObject.container.frame.height = browserCanvas.height // - TOP_SPACE_HEIGHT
        thisObject.container.frame.position.x = browserCanvas.width
        thisObject.container.frame.position.y = 0 // TOP_SPACE_HEIGHT

        if (thisObject.sidePanelTab !== undefined) {
            thisObject.sidePanelTab.resize()
        }
    }

    function getContainer(point, purpose) {
        let container

        container = thisObject.sidePanelTab.getContainer(point, purpose)
        if (container !== undefined) { return container }

        if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            return thisObject.container
        } else {
            return undefined
        }
    }

    function physics() {
        thisObject.sidePanelTab.physics()
        docsAppDivPhysics()

        function docsAppDivPhysics() {
            let docsAppDiv = document.getElementById('docs-space-div')
            docsAppDivPosition = {
                x: 0,
                y: 0
            }
            docsAppDivPosition = thisObject.container.frame.frameThisPoint(docsAppDivPosition)
            docsAppDiv.style = '   ' +
                'overflow-y: scroll;' +
                'overflow-x: hidden;' +
                'position:fixed; top:' + docsAppDivPosition.y + 'px; ' +
                'left:' + docsAppDivPosition.x + 'px; z-index:1; ' +
                'width: ' + thisObject.container.frame.width + 'px;' +
                'height: ' + thisObject.container.frame.height + 'px'
        }
    }

    function draw() {
        if (CAN_SPACES_DRAW === false) { return }
        if (isInitialized === false) { return }
        borders()
        thisObject.sidePanelTab.draw()
    }

    function borders() {
        let point1
        let point2
        let point3
        let point4

        point1 = {
            x: 0,
            y: 0
        }

        point2 = {
            x: thisObject.container.frame.width,
            y: 0
        }

        point3 = {
            x: thisObject.container.frame.width,
            y: thisObject.container.frame.height
        }

        point4 = {
            x: 0,
            y: thisObject.container.frame.height
        }

        point1 = thisObject.container.frame.frameThisPoint(point1)
        point2 = thisObject.container.frame.frameThisPoint(point2)
        point3 = thisObject.container.frame.frameThisPoint(point3)
        point4 = thisObject.container.frame.frameThisPoint(point4)

        browserCanvasContext.setLineDash([0, 0])
        browserCanvasContext.beginPath()
        browserCanvasContext.moveTo(point1.x, point1.y)
        browserCanvasContext.lineTo(point2.x, point2.y)
        browserCanvasContext.lineTo(point3.x, point3.y)
        browserCanvasContext.lineTo(point4.x, point4.y)
        browserCanvasContext.lineTo(point1.x, point1.y)
        browserCanvasContext.closePath()

        let opacity = 1

        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.LIGHT_GREY + ', ' + opacity + ''
        browserCanvasContext.fill()

        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GREY + ', ' + opacity + ''
        browserCanvasContext.lineWidth = 0.3
        browserCanvasContext.stroke()

        /* Shadow */

        if (thisObject.container.status !== 'hidden') {
            for (let i = 0; i <= 30; i++) {
                opacity = 1 - (i / 300) - 0.95

                browserCanvasContext.setLineDash([0, 0])
                browserCanvasContext.beginPath()
                browserCanvasContext.moveTo(point2.x + i, point2.y)
                browserCanvasContext.lineTo(point3.x + i, point3.y)
                browserCanvasContext.closePath()

                browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.BLACK + ', ' + opacity + ''
                browserCanvasContext.lineWidth = 1
                browserCanvasContext.stroke()
            }
        }
    }
}
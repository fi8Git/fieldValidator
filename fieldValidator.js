//  Différents data-attribut : 
//   _______________________________________________________________________________________________________________________________________________
//  |                               |                                               |                                                               |
//  |           Data-*              |                    Value                      |                         Description                           |
//  |_______________________________|_______________________________________________|_______________________________________________________________|
//  | data-valid                    | true                                          | Signal que ce champs et a valider                             |
//  |_______________________________|_______________________________________________|_______________________________________________________________|
//  | data-valid-multiple-by        | radio => class des radios ou name             | Permet de signaler que suivant un choix (radio), les champs   |
//  |                               |                                               | requis ne sont pas les mêmes.                                 |
//  |_______________________________|_______________________________________________|_______________________________________________________________|
//  | data-valid-required-for       | Array                                         | Permet d'indiquer les choix pour lesquel ce champs et requis  |
//  |_______________________________|_______________________________________________|_______________________________________________________________|
//  | data-valid-type               | datetimepicker/summernote/                    | Permet de spécifier le type du champs pour les summernotes ou |
//  |                               | inputGroupWithCheckbox                        | datetimepicker                                                |
//  |_______________________________|_______________________________________________|_______________________________________________________________|
//  | data-valid-toggle-show        | id de l'élément à montrer                     | Permet d'activer un effet de toggle si un champs est faux     |
//  |_______________________________|_______________________________________________|_______________________________________________________________|
//  | data-valid-greater-than       | selecteur du champ à comparer                 | Permet de vérifier la cohérence entre une date de début et    |
//  |                               |                                               | une date de fin (ici la valeur du champs supérieur à la valeur|
//  |                               |                                               | du champ ciblé dans le data-*)                                |
//  |_______________________________|_______________________________________________|_______________________________________________________________|
//  | data-valid-less-than          | selecteur du champ à comparer                 | Permet de vérifier la cohérence entre une date de début et    |
//  |                               |                                               | une date de fin (ici la valeur du champs inférieur à la valeur|
//  |                               |                                               | du champ ciblé dans le data-*)                                |
//  |_______________________________|_______________________________________________|_______________________________________________________________|
//  | data-valid-required-dependance| selecteur du champ à verifier si il n'est pas | Permet de rendre le champ obligatoire si le champ renseigné   |
//  |                               | vide                                          | n'est pas vide                                                |
//  |_______________________________|_______________________________________________|_______________________________________________________________|
//  | data-valid-max-length         | Entier                                        | Vérifie la longueur maximum autorisée                         |
//  |_______________________________|_______________________________________________|_______________________________________________________________|
//  | data-valid-min-length         | Entier                                        | Vérifie la longueur minimum autorisée                         |
//  |_______________________________|_______________________________________________|_______________________________________________________________|
//  | data-valid-range-length       | Array d'entier [min, max]                     | Vérifie la longueur comprise entre deux valeur                |
//  |_______________________________|_______________________________________________|_______________________________________________________________|
//  | data-valid-is-integer         | true                                          | Vérifie si la valeur saisie et un entier                      |
//  |_______________________________|_______________________________________________|_______________________________________________________________| 
//  | data-valid-checkbox-linked    | selecteur de la checkbox à lier               | Si la checkbox est chochée, vérifie si le champs lié n'est    |
//  |                               |                                               | pas null ou vide                                              |
//  |_______________________________|_______________________________________________|_______________________________________________________________|
//  | data-valid-url                | url à interroger                              | Vérifie si la reponse renvoyé par le serveur est true         |
//  |_______________________________|_______________________________________________|_______________________________________________________________|
//  | data-valid-extra-data         | data lié à l'url à interroger                 | Fournie les données à transmettre au serveur                  |
//  |_______________________________|_______________________________________________|_______________________________________________________________|

GetDico([
    "champ_ne_peut_etre_vide", 
    "error_date_anterieur", 
    "error_date_ulterieur", 
    "error_caractere_inferieur", 
    "error_caractere_superieur", 
    "error_non_entier", 
    "msg_mail_incorrect",
    "msg_element_existant"
]);

//#region gestion validations

/**
 * Initialise la validation du formulaire et retourne un boolean (valide/non valide).
 * @param {string} idForm 
 */
async function validateFormAsync(idForm){
    let form = document.querySelector(idForm);
    
    if(form.hasAttribute("data-valid-multiple-by") && !checkRadioChoise(idForm, form.dataset.validMultipleBy))
        return false;

    return await validationFieldsAsync(getModelValidateField(idForm));
}

/**
 * Boucle sur chaque champs et lance la verification du champs.
 * @param {Array} listField 
 */
async function validationFieldsAsync(listField){
    for(const field of listField)
        field.success = await verifFieldAsync(field);

    if(listField.every(f => f.success)){
        listField.forEach(f => removeEventField(f));
        return true;
    }

    return false;
}

/**
 * Vérifie le champs. Suivant le retour, assigne des évènements et le style du champs.
 * @param {Object} field 
 * @param {boolean} firstVerif 
 */
async function verifFieldAsync(field, firstVerif = true) {

    field.validationAttr = getFieldValidationAttr(field.element, field.idForm);

    if (firstVerif)
        await addEventFieldAsync(field);

    if(field.validationAttr.required && !checkHasValue(field)){
        setFieldError(field, Dico.get("champ_ne_peut_etre_vide"));
        return false;
    }

    if(field.validationAttr.greaterThan && checkHasValue(field) && !checkIsGreaterThan(field)){
        setFieldError(field, Dico.get("error_date_anterieur").format(field.validationAttr.greaterThan.value));
        return false;
    }

    if (field.validationAttr.lessThan && checkHasValue(field)  && !checkIsLessThan(field)){
        setFieldError(field, Dico.get("error_date_ulterieur").format(field.validationAttr.lessThan.value));
        return false;
    }

    if (field.validationAttr.maxLength && checkHasValue(field) && !checkMaxLength(field)){
        setFieldError(field, Dico.get("error_caractere_superieur").format(field.validationAttr.maxLength));
        return false;
    }

    if(field.validationAttr.minLength && checkHasValue(field) && !checkMinLength(field)){
        setFieldError(field, Dico.get("error_caractere_inferieur").format(field.validationAttr.minLength));
        return false;
    }

    if(field.validationAttr.isInteger && checkHasValue(field) && !checkIsInteger(field)){
        setFieldError(field, Dico.get("error_non_entier"));
        return false;
    }

    if (field.validationAttr.checkEmail && checkHasValue(field) && !checkIsEmail(field)) {
        setFieldError(field, Dico.get("msg_mail_incorrect")); 
        return false;
    }

    if (field.validationAttr.url && checkHasValue(field)) {
        let isValid = await checkIsValidByUrlAsync(field.validationAttr.url + field.element.value, field.element.dataset.validExtraData)

        if(!isValid){
            setFieldError(field, Dico.get("msg_element_existant"));
            return false;
        }
    }

    if(checkHasValue(field)){
        setFieldSuccess(field, firstVerif);
        return true;
    }

    resetField(field);
    return true;

}

//#endregion

//#region selecteur

/**
 * Construit et retourne un modèle qui reprèsente une liste des différentes informations des 
 * champs à vérifier
 * @param {string} idForm 
 */
function getModelValidateField(idForm){
    let listField = document.querySelectorAll(`${idForm} [data-valid='true']`);
    let model = [];

    for(const field of listField)
        model.push({
            textError: [],
            idToggle: field.dataset.validToggleShow,
            checkboxLinked: field.dataset.validCheckboxLinked,
            type: getFieldType(field),
            validationAttr: getFieldValidationAttr(field, idForm),
            idForm: idForm,
            idError: `error-${field.id}`,
            element: field,
            success: false,
        });

    return model;
}

function getFieldValidationAttr(field, idForm){
    let form = document.querySelector(idForm);
    let validations = {};
    let choixValue = null;

    if(form.hasAttribute("data-valid-multiple-by")){
        let radioSelector = form.dataset.validMultipleBy;
        let choix = document.querySelector(`${idForm} ${radioSelector}:checked`);

        if(choix != null)
            choixValue = choix.value;
    }
    
    if(choixValue != null && field.hasAttribute("data-valid-required-for")){
        let data = JSON.parse(field.dataset.validRequiredFor);

        if(data.some(d => d == choixValue))
            validations.required = true;
    }
    
    if(field.hasAttribute("required"))
        validations.required = true;

    if(field.hasAttribute("data-valid-less-than"))
        validations.lessThan = field.dataset.validLessThan;

    if(field.hasAttribute("data-valid-greater-than"))
        validations.greaterThan = document.querySelector(field.dataset.validGreaterThan);
    
    if(field.hasAttribute("data-valid-required-dependance")){
        let requiredField = document.querySelector(field.dataset.validRequiredDependance);
        validations.required = requiredField.value != null && requiredField.value != "";
    }

    if(field.hasAttribute("data-valid-checkbox-linked")){
        let checkbox = document.querySelector(field.dataset.validCheckboxLinked);
        validations.required = checkbox.checked;
    }

    if(field.hasAttribute("data-valid-max-length"))
        validations.maxLength = field.dataset.validMaxLength;
    
    if(field.hasAttribute("data-valid-min-length"))
        validations.minLength = field.dataset.validMinLength;

    if(field.hasAttribute("data-valid-range-length")){
        validations.minLength = JSON.parse(field.dataset.validRangeLength)[0];
        validations.maxLength = JSON.parse(field.dataset.validRangeLength)[1];
    }

    if(field.hasAttribute("data-valid-is-integer"))
        validations.isInteger = true;
    
    if(field.type == "email")
        validations.checkEmail = true;

    return validations;
}

function getFieldType(field){
    if(field.hasAttribute("data-valid-type"))
        return field.dataset.validType;
    
    return field.localName;
}

function getFieldErrorContainer(field){
    if(field.type == "datetimepicker" || field.type == "inputGroup")
        return field.element.parentElement.parentElement;

    return field.element.parentElement;
}

//#endregion

//#region field render

// Radio Element
function addErrorRadio(idForm, radioSelector){
    let formGroupRadio = document.querySelector(`${idForm} ${radioSelector}`).closest(".form-group");
    let radioElements = document.querySelectorAll(`${idForm} ${radioSelector}`);

    renderMsgError(formGroupRadio, "error-choice", Dico.get("champ_ne_peut_etre_vide"));

    for(const elt of radioElements)
        elt.addEventListener("change", async () => await validateFormAsync(idForm));
}

function removeErrorRadio(errorArea, idForm){
    let radioElements = document.querySelectorAll(`${idForm} ${radioSelector}`);

    errorArea.remove();

    for(const elt of radioElements)
        elt.addEventListener("change", () => resetFields(getModelValidateField(idForm)));
}

// Field Element
/**
 * Mise en forme d'un champs lors d'un retour d'erreur
 * @param {Object} field 
 */
function setFieldError(field, textError){
    field.element.closest(".form-group").classList.add("has-error");
    
    if(field.type == "summernote")
        field.element.parentElement.querySelector(".note-editor").classList.add("has-error-summernote");

    renderMsgError(getFieldErrorContainer(field), field.idError, textError);

    if (field.idToggle)
        $(field.idToggle).slideDown();
}

function resetField(field){
    if(field.type == "summernote"){
        let summernote = field.element.parentElement.querySelector(".note-editor");
        if(summernote.classList.contains("has-error-summernote"))
            summernote.classList.remove("has-error-summernote");
        
        if(summernote.classList.contains("has-success-summernote"))
            summernote.classList.remove("has-success-summernote");
    }else{
        let div = field.element.closest(".form-group");
        if(div.classList.contains("has-error"))
            div.classList.remove("has-error");
        
        if(div.classList.contains("has-success"))
            div.classList.remove("has-success");
    }
      
    removeMsgError(field.idError);
}

/**
 * Mise en forme d'un champs lors d'un retour sans erreur
 * @param {Object} field 
 * @param {boolean} firstVerif 
 */
function setFieldSuccess(field){
    if(field.type == "summernote"){
        let summernote = field.element.parentElement.querySelector(".note-editor");

        if(summernote.classList.contains("has-error-summernote"))
            summernote.classList.remove("has-error-summernote")

        if(!summernote.classList.contains("has-success-summernote"))
            summernote.classList.add("has-success-summernote");

    }else{
        let div = field.element.closest(".form-group");

        if(div.classList.contains("has-error"))
            div.classList.remove("has-error");

        if(!div.classList.contains("has-success"))
            div.classList.add("has-success");
    }

    removeMsgError(field.idError);
}

function removeMsgError(idError){
    let errorElement = document.getElementById(idError);

    if(errorElement)
        errorElement.remove();
}

function renderMsgError(selectorErrorArea, idError, textError){
    let errorElement = document.getElementById(idError);

    if(errorElement){
        errorElement.innerText = textError;
    }else{
        errorElement = `<span id="${idError}" class="fieldErrorText">
                            ${textError}
                        </span>`;
    
        selectorErrorArea.insertAdjacentHTML("beforeend", errorElement);
    }
}

/**
 * Marque les champs obligatoire d'un * suivant le type d'action selectionné
 * @param {string} typeAction 
 * @param {string} formSelector 
 */
function showObligatoryField(typeAction, formSelector){
    let listValidField = document.querySelectorAll(`${formSelector} [data-valid-required-for]`);

    for(const field of listValidField){
        let label = field.closest(".form-group").querySelector("label");

        if(field.dataset.validRequiredFor.includes(typeAction.toString()) && !label.classList.contains("required"))
            label.classList.add("required");

        if(!field.dataset.validRequiredFor.includes(typeAction.toString()) && label.classList.contains("required"))
            label.classList.remove("required");
    }
}

/**
 * Réinitialise les champs: enlève les messages d'erreurs, les styles et les évènements liés.
 * @param {Array} listField 
 */
function resetFields(listField){
    listField.forEach(f => {
        if(f.type == "summernote")
            f.element.closest(".note-editor").classList.remove(["has-error-summernote", "has-success-summernote"]);

        f.element.closest(".form-group").classList.remove(["has-error", "has-success"]);
        let errorElt = document.querySelector(`#${f.idError}`);

        if(errorElt != null)
            errorElt.remove();

        removeEventField(f);
    });
}

/**
 * Purge les syles et msg d'erreurs des différents champs du formulaire
 * @param {String} fieldsSelector 
 */
function purgeFormFieldsErrorAndStyle(formSelector){
    let fieldsDiv = document.querySelectorAll(`${formSelector} .form-group`);

    for(const div of fieldsDiv){
        let errorArea = div.querySelector(".fieldErrorText");
        div.classList.remove(["has-success", "has-error"]);

        if(errorArea) 
            errorArea.remove();
    }
}

//#endregion

//#region Check

function checkRadioChoise(idForm, radioSelector){
    let radioSelected =  document.querySelector(`${idForm} ${radioSelector}:checked`);
    let errorArea = document.getElementById("#error-choice");
    
    if(radioSelected == null){
        addErrorRadio(idForm, radioSelector);
        return false;
    }
    
    if(errorArea != null)
        removeErrorRadio(errorArea, idForm);

    return true;
}

function checkHasValue(field){
    let fieldValue = field.element.value;
    let fieldType = field.type;

    if(fieldValue == null)
        return false;

    if((typeof fieldValue === 'string' || fieldValue instanceof String) && fieldValue.trim() == "")
        return false;

    if(Array.isArray(fieldValue) && fieldValue.length == 0)
        return false;

    if(fieldType == "inputGroup" && fieldValue == "0")
        return false;

    if(fieldType == "summernote" && fieldValue.trim() == "")
        return false;

    return true;
}

function checkIsGreaterThan(field){
    let fieldValueToCompare = field.validationAttr.greaterThan.value;
    let thisFieldValue = field.element.value;

    if(fieldValueToCompare == null)
        return true;

    return new Date(thisFieldValue) >= new Date(fieldValueToCompare);
}

function checkIsLessThan(field){
    let fieldValueToCompare = field.validationAttr.lessThan.value;
    let thisFieldValue = field.element.value;

    if(fieldValueToCompare == null)
        return true;

    return new Date(thisFieldValue) <= new Date(fieldValueToCompare);
}

function checkMaxLength(field){
    let thisFieldValueLength = field.element.value.length;
    return thisFieldValueLength <= field.validationAttr.maxLength;
}

function checkMinLength(field){
    let thisFieldValueLength = field.element.value.length;
    return thisFieldValueLength >= field.validationAttr.minLength;
}

function checkIsInteger(field){
    return Number.isInteger(parseInt(field.element.value));
}

function checkIsEmail(field) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let email = field.element.value;
    return re.test(String(email).toLowerCase());
}

async function checkIsValidByUrlAsync(url, extraData){
    let param = {
        url: url,
        dataType: "json",
        type: "GET",
        contentType: "application/json; charset=utf-8",
    }

    if(extraData !== undefined)
        param.data = extraData;

    return new Promise((response) => {
        param.success = (result) => response(result);
        $.ajax(param);
    });
}

//#endregion

//#region gestion évènements

/**
 * Ajoute un évènement qui relance la vérification du champs en fonction de son type (input, select, datetimepicker, etc...).
 * @param {Object} field 
 */
async function addEventFieldAsync(field){
    switch (field.type) {
        case "input":
            $(field.element).keyup(async () => await verifFieldAsync(field, false));
            break;
        case "textarea":
            $(field.element).keyup(async () => await verifFieldAsync(field, false));
            break;
        case "select":
            $(field.element).change("change", async (e) => await verifFieldAsync(field, false));
            break;
        case "summernote":
            $(field.element).parent().find(".note-editor").find(".note-editable").keyup(async () => await verifFieldAsync(field, false));
            break;
        case "datetimepicker":
            $(field.element).parent().on('dp.change', async (e) => await verifFieldAsync(field, false));
            break;
        case "inputGroup":
            $(field.element).change(async () => await verifFieldAsync(field, false));
            $(field.checkboxLinked).click(async () => await verifFieldAsync(field, false));
            break;
    }
}

/**
 * Enlève un évènement du champs en fonction de son type (input, select, datetimepicker, etc...).
 * @param {Object} field 
 */
function removeEventField(field){
    switch(field.type){
        case "input":
            $(field.element).off("keyup");
        break;
        case "textarea":
            $(field.element).off("keyup");
        break;
        case "select":
            $(field.element).off("change");
        break;
        case "summernote":
            $(field.element).parent().find(".note-editor").find(".note-editable").off("keyup");
        break;
        case "datetimepicker":
            $(field.element).parent().off('dp.change');
        break;
        case "inputGroup":
            $(field.checkboxLinked).off("click");
            $(field.element).off("change");
        break;
    }
}

//#endregion

function removeValidationField(blocField){
    $(blocField).removeClass("has-success has-error");
    $(blocField).find(".fieldErrorText").remove();
    $(blocField).find(".form-control").off();
}

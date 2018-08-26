jewel.dom = (function () {

	function $(path, parent){
		parent = parent || document;
		return parent.querySelectorAll(path);
	}

	function hasClass(el, clsName){
		var regex = new RegEx("(^|\\s)" + clsName + "(\\s|$)");
		return regex.test(el.className);
	}

	function addClass(el, clsName) {
		if(!hasClass(el, clsName)){
			el.className += " " + clsName;
		}
	}

	function removeClass(el, clsName){
		var regex = new RegEx("(^|\\s)" + clsName + "(\\s|$)");
		el.className = el.className.replace(regex, " ");
	}

	return {
		$ : $,
		hasClass : hasClass,
		addClass : addClass,
		removeClass : removeClass
	};

}) ();
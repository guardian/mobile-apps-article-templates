function alertSwitch(following, followid) {

	followObject = $("#alert[follow-alert-id='"+followid+"']");
	if (followObject) {
		if (following == 1) {
			if (followObject.hasClass("following") == false) {
				followObject.addClass("following");
			}
		} else {
			if (followObject.hasClass("following")) {
				followObject.removeClass("following");
			}
		};
	}
	
};
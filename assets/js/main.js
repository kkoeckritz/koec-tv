let generic = {
	isInView: (e) => {
		if (typeof jQuery === "function" && e instanceof jQuery) {
			el = el[0];
		}
		let rect = e.getBoundingClientRect();
		return (
			rect.top >= 0 &&
			rect.left >= 0 &&
			rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
			rect.right <= (window.innerWidth || document.documentElement.clientWidth)
		);
	},
	beginLoading: () => {
		$(".blank").fadeOut(1000);
		$(".desktop").hide();
		$(".assistantTyper").hide();
	},
	doneLoading: () => {
		$(".preloaderText").text("WELCOME");
		$(".preloaderDotZone").addClass("hide");
		$(".preloader").fadeOut(1000).promise().done(() => {
			$(".desktop").fadeIn(500);
		});

		$(".webcamLight").addClass("blinking");
	}
};

let screen = {
	descInt: null,

	setPower: () => {
		$(".powerButton").click(() => {
			$(".blank").toggle();
			$(".powerButton").toggleClass("pressed")
			$(".powerButtonLight").toggleClass("lit");
			$(".webcamLight").toggleClass("blinking");
		});
	},

	setPrintDesc: () => {
		$(".hasDesc").hover((e) => {
			// animate to description
			let $typer = $(".assistantTyper");
			let $desc = $(".assistantText");
			let descText = $(e.target).data("desc");
			let i = 0;

			$(".assistant").addClass("focused");
			$typer.stop().show();
			$typer.css("opacity", "1");
			$desc.stop().show();
			$desc.css("opacity", "1");
			$desc.text("");

			screen.descInt = setInterval(() => {
				let curDesc = $desc.text();
				if (curDesc != descText) {
					$desc.text(curDesc + [...descText[i]]);
				} else {
					clearInterval(screen.descInt);
					$desc.removeClass("typing");
					$desc.addClass("doneTyping");
				}
				i++;
			}, 25);
			
		}, (e) => {
			// clear description
			clearInterval(screen.descInt);
			let $typer = $(".assistantTyper");
			let $desc = $(".assistantText");
			$desc.removeClass("doneTyping");
			$desc.addClass("typing");
			$desc.fadeOut(250);
			$typer.fadeOut(250).promise().done(() => {
				$desc.text("");
			});
			$(".assistant").removeClass("focused");
		});
	},

  setLinks: () => {
    $(".navLink").click((e) => {
      // identify old/new sections
      let oldId = $(".selected").attr("id");
			if (oldId) {
      	var oldSection = oldId.substring(oldId.length - 1);
			}
      let newId = $(e.target).attr("id");
      let newSection = newId.substring(newId.length - 1);

      // make sure new section is different
      if (oldSection !== newSection) {
        // bold clicked link
        $(".navLink").removeClass("selected");
        $(e.target).addClass("selected");

        // change shown section
				$(".svgBox").removeClass("growAnim");
				$(".svgBox").addClass("shrinkAnim");
        // $(`#section_${oldSection}`).hide();
        // $(`#section_${newSection}`).fadeIn(1200);
      }
    });
  }
};

let rings = {
	// draw svg rings over contact info
	drawRings: () => {
		let rings = "";
		
		for (let i = 0; i < 1; i++) {
			let rx = 30 + (i * 3);
			let ry = 40 + (i * 3);
			let st = 2;

			rings += (`<ellipse rx="${rx}%" ry="${ry}%" cx="50%" cy="50%" stroke-width="${st}" class="svgRing ringAnim-${i % 3}" />`);
		}

		$(`<svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 1000 1000" class="svgBox growAnim">${rings}</svg>`).appendTo(".svgWrapper");
	}
};

// before content loaded
$(document).ready(() => {
	generic.beginLoading();
})

// once content loaded
$(window).on("load", () => {
	generic.doneLoading();
	screen.setPower();
	screen.setPrintDesc();
	screen.setLinks();
	rings.drawRings();
});

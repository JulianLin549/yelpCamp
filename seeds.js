const mongoose = require("mongoose");
const Campground = require("./models/campground");
const Comment = require("./models/comment");
const seeds = [{
        name: "Cloud Rest",
        image: "https://www.nationalparks.nsw.gov.au/-/media/npws/images/parks/new-england-national-park/thungutti-campground/thunhgutti-campground-01.jpg",
        description: "Nestled under the shade of the tall eucalypt trees, you’ll find plenty of tucked away and secluded campsites to pitch a tent at Thungutti campground.\n Relax and enjoy the lush greenness of scattered ferns around you, listening to the kookaburras laughing in the trees above.\n  Once you get settled, it’s time to explore. Tea Tree Falls walking track starts right here, taking you through tea tree woodland and across the Styx River headwaters to a forest of hanging moss. Or head off on Eagles Nest walking track to discover the incredible natural wonders of the ancient Gondwana rainforest.On your return, you’ll find a barbecue shelter for cooking up a tasty dinner and a place to enjoy the warmth of the campfire. Then, snuggle up for a good night’s rest, before your sunrise visit to Point lookout.",
    },
    {
        name: "Dry River",
        image: "https://media-cdn.tripadvisor.com/media/photo-s/01/d9/bc/da/cougar-rock-campground.jpg",
        description: "Dry River Campground offers a woodland setting, located in the heart of Crawford Notch State Park. Flush toilets and showers are located in the campground. Pets are welcomed in the camping area, but must be leashed and attended at all times."
    },
    {
        name: "Cattai Camp",
        image: "https://www.nationalparks.nsw.gov.au/-/media/npws/images/parks/new-england-national-park/thungutti-campground/thunhgutti-campground-01.jpg",
        description: "Cattai campground is a great place for a weekend getaway with family or friends and a good place to stop with your campervan on a driving tour. \n Once you’ve picked the perfect campsite and pitched your tent, it’s time to start exploring. Kids will love the wide open space that is great for bike riding, playing and running, plus the campground is right near the Hawkesbury River, meaning fishing, canoeing and kayaking opportunities are all nearby. There are shady spots to enjoy a barbecue dinner and the picnic area is nearby for lunchtime activities."
    }
];

async function seedDB() {
    try {
        await Comment.deleteMany({});
        //console.log('comment removed')
        //remove all campgrounds
        await Campground.deleteMany({});
        //console.log('campground removed')

        for (const seed of seeds) {
            //add a few campgrounds
            let campground = await Campground.create(seed);
            //console.log('campground created')
            let comment = await Comment.create({
                text: "This place is Gresy, but I wish there was WIFI",
                author: "Homwer Good"
            })
            //console.log('comment created')
            //push comment to campgrounds 
            campground.comments.push(comment);
            campground.save();
            //console.log("comment added to campground")
        }
    } catch (err) {
        console.log(err)
    };
}
module.exports = seedDB;
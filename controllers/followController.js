const Follow = require('../models/Follow')

exports.follow = async (req, res) => {
    try {
        const follow = new Follow(req.params.username, req.visitorId)
        await follow.save()
        req.flash("success", `Followed ${req.params.username}`)
        await req.session.save()
        res.redirect(`/profile/${req.params.username}`)
    } catch(e) {
        if(e == `Already following ${req.params.username}.`) {
            req.flash("errors", e)
            await req.session.save()
            res.redirect(`/profile/${req.params.username}`)
        } else {
            req.flash("errors", e)
            await req.session.save()
            res.redirect('/')
        }
    }
}

exports.unfollow = async (req, res) => {
    try {
        const follow = new Follow(req.params.username, req.visitorId)
        await follow.delete()
        req.flash("success", `Unfollowed ${req.params.username}`)
        await req.session.save()
        res.redirect(`/profile/${req.params.username}`)
    } catch(e) {
        if(e == `Already unfollowed ${req.params.username}.`) {
            req.flash("errors", e)
            await req.session.save()
            res.redirect(`/profile/${req.params.username}`)
        } else {
            req.flash("errors", e)
            await req.session.save()
            res.redirect('/')
        }
    }
}

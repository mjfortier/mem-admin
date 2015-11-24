'use strict';
// =========================================================================
//
// Base controller for all simple CRUD stuff, just to save some typing
//
// =========================================================================
var helpers = require('./core.helpers.controller');
var mongoose     = require ('mongoose');

// -------------------------------------------------------------------------
//
// options are
// {
// 	populate : the populate string
// 	sort : the sort string
// }
//
// -------------------------------------------------------------------------
module.exports = function (Model, options) {
	this.Model = Model;
	options = options || {};
	this.options = {};
	this.options.sort = options.sort || '';
	this.options.populate = options.populate || '';
	// -------------------------------------------------------------------------
	//
	// Used by a bunch of functions
	//
	// -------------------------------------------------------------------------
	this.respond = helpers.queryResponse;
	// -------------------------------------------------------------------------
	//
	// GET new
	//
	// -------------------------------------------------------------------------
	this.new = function (pre) {
		var self = this;
		return function (req, res) {
			var Model = new self.Model ();
			if (pre) pre (Model, helpers.queryResponse (res));
			else res.json (Model);
		};
	};
	// -------------------------------------------------------------------------
	//
	// POST
	//
	// -------------------------------------------------------------------------
	this.create = function (pre) {
		var self = this;
		return function (req, res) {
			var Model = new self.Model (req.body);
			if (pre) pre (Model);
			Model.save (helpers.queryResponse (res));
		};
	};
	// -------------------------------------------------------------------------
	//
	// GET
	//
	// -------------------------------------------------------------------------
	this.read = function (pre) {
		var self = this;
		return function (req, res) {
			var Model = req[ self.Model.modelName ];
			if (pre) pre (Model, helpers.queryResponse (res));
			else res.json (Model);
		};
	};
	// -------------------------------------------------------------------------
	//
	// PUT
	//
	// -------------------------------------------------------------------------
	this.update = function (pre) {
		var self = this;
		return function (req, res) {
			var datamodel = req[ self.Model.modelName ];
			datamodel.set (req.body);
			if (pre) pre (datamodel);
			datamodel.save (helpers.queryResponse (res));
		};
	};
	// -------------------------------------------------------------------------
	//
	// DELETE
	//
	// -------------------------------------------------------------------------
	this.delete = function () {
		var self = this;
		return function (req, res) {
			var datamodel = req[ self.Model.modelName ];
			datamodel.remove (helpers.queryResponse (res));
		};
	};
	// -------------------------------------------------------------------------
	//
	// GET *
	//
	// -------------------------------------------------------------------------
	this.list = function (q) {
		q = q || {};
		var self = this;
		return function (req, res) {
			var s = '';
			var p = '';
			self.Model.find(q).sort(self.options.sort).populate(self.options.populate).exec(helpers.queryResponse (res));
		};
	};
	// -------------------------------------------------------------------------
	//
	// Automatic variable replacement from URL parameters
	//
	// -------------------------------------------------------------------------
	this.getObject = function () {
		var self = this;
		return function (req, res, next, id) {
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return helpers.sendErrorMessage (res, 'Invalid object id supplied');
			}
			self.Model.findById(id).populate(self.options.populate).exec(function (err, model) {
				if (err) {
					return next (err);
				} else if (!model) {
					return helpers.sendNotFound (res, self.Model.modelName+' not found');
				}
				req[ self.Model.modelName ] = model;
				next ();
			});
		};
	};
	// -------------------------------------------------------------------------
	//
	// Automatic add parameter to the base
	//
	// -------------------------------------------------------------------------
	this.getId = function () {
		var self = this;
		return function (req, res, next, id) {
			req[ self.Model.modelName.toLowerCase() + 'Id' ] = id;
			next ();
		};
	};
};

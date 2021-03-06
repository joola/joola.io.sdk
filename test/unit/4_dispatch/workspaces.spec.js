/**
 *  @title joola.io
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/

describe("workspaces", function () {
  before(function (done) {
    this.uid = joola.common.uuid();
    done();
  });

  it("should add an workspace", function (done) {
    var workspace = {
      key: 'test-workspace-' + this.uid,
      name: 'test-workspace-' + this.uid,
      filter: ''
    };
    joola.workspaces.add(workspace, function (err, _workspace) {
      if (err)
        return done(err);

      expect(_workspace).to.be.ok;
      done();
    });
  });

  it("should return a valid list of workspaces", function (done) {
    joola.workspaces.list(function (err, workspaces) {
      return done(err);
    });
  });

  it("should fail adding an existing workspace", function (done) {
    var workspace = {
      key: 'test-workspace-' + this.uid,
      name: 'test-workspace-' + this.uid,
      filter: ''
    };
    joola.workspaces.add(workspace, function (err, _workspace) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should fail to add an workspace with incomplete details", function (done) {
    var workspace = {

    };
    joola.workspaces.add(workspace, function (err, _workspace) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });

  it("should update a workspace", function (done) {
    var workspace = {
      key: 'test-workspace-' + this.uid,
      name: 'test-workspace-' + this.uid,
      filter: 'test=test'
    };
    joola.workspaces.patch(workspace.key, workspace, function (err, _workspace) {
      if (err)
        return done(err);
      expect(_workspace.filter).to.equal('test=test');
      done();
    });
  });

  it("should fail updating unknown workspace", function (done) {
    var workspace = {
      key: 'test-workspace1-' + this.uid,
      name: 'test-workspace-' + this.uid,
      filter: 'test=test'
    };
    joola.workspaces.patch(workspace.key, workspace, function (err, _workspace) {
      if (err)
        return done();

      done(new Error('This should have failed'));
    });
  });

  xit("should apply filter on workspace members", function (done) {
    var user = {
      username: 'tester-workspace-filter',
      displayName: 'tester user',
      password: '1234',
      roles: ['user'],
      filter: '',
      workspace: 'test-workspace-' + this.uid
    };
    joola.dispatch.users.add('test-workspace-' + this.uid, user, function (err, user) {
      if (err)
        return done(err);
      expect(user._filter).to.equal('test=test');
      return done(err);
    });
  });

  it("should delete an workspace", function (done) {
    var self = this;
    var workspace = {
      key: 'test-workspace-' + this.uid,
      name: 'test-workspace-' + this.uid
    };
    joola.workspaces.delete(workspace.key, function (err) {
      if (err)
        return done(err);

      joola.workspaces.list(function (err, workspaces) {
        if (err)
          return done(err);

        var exist = _.filter(workspaces, function (item) {
          return item.name == 'test-workspace-' + self.uid;
        });
        try {
          expect(exist.length).to.equal(0);
          done();
        }
        catch (ex) {
          done(ex);
        }
      });
    });
  });

  it("should fail deleting a non existing workspace", function (done) {
    var workspace = {
      key: 'test-workspace-' + this.uid
    };
    joola.workspaces.delete(workspace.key, function (err) {
      if (err)
        return done();

      return done(new Error('This should fail'));
    });
  });
});
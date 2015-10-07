$(function() {

    var items, username;

    Parse.initialize(
        "IxOWIIHkx64xXebpyt0fZLL2ZfGjHtbIEcf4vMqN",
        "zVh9Vuqh6FhN6eWR86ZuX8fWlVGDNC36VLfBnF1q"
    );

    if (Parse.User.current()) {
        items = JSON.parse(Parse.User.current().attributes.todo);
        username = Parse.User.current().attributes.username;
        showPage();
    } else {
        showPage(true);
    };

    $('#logoutBtn').click(function(){
        Parse.User.logOut();
        showPage(true);
    });

    $('#authForm').submit(function(){
        $("#submitBtn").attr("disabled", "disabled");

        if ($('#newuser').prop("checked")) {
            signup();
        } else {
            login();
        }

        return false;
    });

    function saveItems(){
        Parse.User.current().save(
            {
                todo: JSON.stringify(items), 
                username: username
            },
            {
                success: function(user) {
                    console.log(user);
                },
                error: function(user, error) {
                    console.log(user, error);
                }
            }
        );
    }

    function signup(){
        Parse.User.signUp(
            $('#username').val(),
            $('#password').val(),
            { todo: JSON.stringify(items) },
            {
                success: function(user) {
                    showPage();
                },
                error: function(user, error) {
                    $('#authMsg').html(error.message).show();
                    $("#submitBtn").removeAttr("disabled");
                }
            }
        );
        return false;
    }

    function login(){
        Parse.User.logIn(
            $('#username').val(),
            $('#password').val(),
            {
                success: function(user) {
                    items = JSON.parse(user.attributes.todo);
                    showPage();
                },
                error: function(user, error) {
                    $('#authMsg').html(error.message).show();
                    $("#submitBtn").removeAttr("disabled");
                }
            }
        );
        return false;
    }

    function showPage(auth){
        if (auth) {
            $('#authPage').show();
            $('#appPage').hide();
            $('#authMsg').hide();
        } else {
            $('#authPage').hide();
            $('#appPage').show();
            $('#userNameLabel').text(username);
            $("#submitBtn").removeAttr("disabled");
            $("#addBtn").attr("disabled", "disabled");
            $('#newItem').val('');
            $('#addBtn').click(addItem);
            $("#newItem").keyup(newItemKeyUp);
            renderItems();
        }
    }

    function newItemKeyUp(e) {
        if ($('#newItem').val() === '') {
            $("#addBtn").attr("disabled", "disabled");
            return;
        } else {
            $("#addBtn").removeAttr("disabled");
        }
        if (e.keyCode == 13) {
            addItem();
        }
    }

    function addItem(){
        items.unshift($('#newItem').val());
        $('#newItem').val('');
        $("#addBtn").attr("disabled", "disabled");
        renderItems();
        saveItems();
    }

    function deleteItem(){
        var n = $('.item').index($(this).closest('.item'));
        items.splice(n,1);
        renderItems();
        saveItems();
    }

    function editItem(){
        var item = $(this).closest('.item');
        var n = $('.item').index(item);
        $('.e, .x').hide();
        var el = $($('#editTemplate').html());
        el.find('input').val(items[n]);
        el.find('#saveBtn').click(function(){
            items[n] = $('#edit input').val();
            renderItems();
            saveItems();
        });
        el.find('#cancelBtn').click(function(){
            renderItems();
        });
        item.replaceWith(el);
    }

    function renderItems(){
        $('#itemList').html('');
        for (var i = 0; i < items.length; i++) {
            var el = $($('#itemTemplate').html());
            el.find('label').text(items[i]);
            el.find('.x').click(deleteItem);
            el.find('.e').click(editItem);
            $('#itemList').append(el);
        }
    }
});
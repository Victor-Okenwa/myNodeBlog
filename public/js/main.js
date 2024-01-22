const toggleSidebar = () => {
    const sidebar = document.querySelector('.nav-sidebar');
    sidebar.classList.toggle('translate');
}

const categories = [
    "Adventure",
    "Agriculture",
    "Business",
    "Comedy",
    "Development",
    "Education",
    "Entertainment",
    "Fashion",
    "Food",
    "Gaming",
    "Health",
    "History",
    "Industry",
    "Lifestyle",
    "Nature",
    "News",
    "Sports",
    "Technology",
    "Transportation",
    "Trends",
    "Others"
];

const addOptions = (box) => {
    categories.map(option => {
        const optionTag = `<option value="${option}">${option}</option>`;
        box.insertAdjacentHTML('beforeend', optionTag);
    })
}

const addFilterOptions = (btn) => {
    const filterContainer = btn.parentElement.querySelector('.filter');
    const filterOptions = btn.parentElement.querySelectorAll('.filter span');
    filterContainer.classList.toggle('d-none');
    if (filterOptions.length < 2) {
        categories.map(option => {
            const spanTag = `<span value="${option}"  onclick="chooseFilter(this)">${option}</option>`;
            filterContainer.insertAdjacentHTML('beforeend', spanTag);
        })
    }
}


const chooseFilter = (option) => {
    const blogs = document.querySelector('main .blog-container .blogs');
    const selectedCategory = option.parentElement.parentElement.querySelector('button .selected');
    const filterOptions = [...option.parentElement.querySelectorAll('.filter span')];


    if (!option.classList.contains('selected')) {
        filterOptions.map(option => {
            option.classList.contains('selected') ? option.classList.remove('selected') : '';
        });
        selectedCategory.textContent = option.textContent
        option.classList.add('selected');
        $.ajax({
            url: '/filter',
            method: 'POST',
            dataType: "json",
            headers: {
                contentType: 'application/json',
            },
            data: {
                option: option.getAttribute('value'),
            },
            success: function (data) {
                if (data.posts.length > 0) {
                    blogs.innerHTML = '';
                    data.posts.map(pd => {
                        blogs.insertAdjacentHTML('beforeend', `
                            <div class="blog">
                                <div class="floater"></div>
                                <div class="blog-image">
                                    <img src="/thumbnails/${pd.thumbnail}" alt="">
                                </div>
                                <div class="blog-content">
                                    <div class="blog-header">
                                        ${pd.title}                       
                                    </div>
                                    <div class="blog-body">
                                        ${pd.content}
                                    </div>

                                    <div class="blog-info">
                                        <span><i class="fa fa-user"></i> <span>${pd.poster}</span> </span>
                                        <span><i class="fa fa-heart"></i> <span>${pd.likes}</span> </span>
                                        <span><i class="fa fa-eye"></i> <span>${pd.views}</span> </span>
                                        <span><i class="fa fa-calendar-alt"></i> <span>${pd.postedOn}</span> </span>
                                    </div>
                                    <div class="blog-btn"><a href="post/${pd.id}" class="btn bg-norm text-light">Read more <i
                                                class="fa fa-long-arrow-alt-right"></i></a></div>
                                </div>
                            </div>
                        `);
                    });
                } else {
                    blogs.innerHTML = `<h2 class="text-center">No post found</h1> `;
                }
            },
            error: function (xhr, status, error) {
                console.log(status, error);
            }
        });
    }
}

const toggle2ndElement = (btn) => {
    const object = btn.parentElement.parentElement.querySelector('.toggleThis');
    if (object.classList.contains('d-none')) {
        object.classList.remove('d-none')
    } else {
        object.classList.add('d-none');
    }
    if (object.replyTo) {
        object.replyTo.value = btn.id;
    }
}

const toggle1stElement = (btn) => {
    const object = btn.parentElement.querySelector('.toggleThis');
    if (object.classList.contains('d-none')) {
        object.classList.remove('d-none')
    } else {
        object.classList.add('d-none');
    }
}

const postComment = async (button) => {
    const form = await button.parentElement.parentElement;
    const postId = await form.postId.value.trim();
    const comment = await form.comment.value.trim();
    const commentCount = document.getElementById('commentCount');
    const commentsContainer = document.querySelector('.commentsContainer');
    try {
        const res = await fetch('/comment', {
            method: 'POST',
            body: JSON.stringify({
                postId,
                comment
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await res.json();
        if (data.unsigned) {
            alert("Please log in");
        }

        if (data.success) {
            if (data.type == 'comment') {
                const cd = data.commentData;
                commentCount.textContent = data.comments;

                const commentDiv = `
                    <div class="comment">
                    <div class="comment-head">
                        <a href="/profile/${cd.commenterId}" class="profile">
                            <img src="/profile/${cd.commenterProfile}" alt="">
                            <span
                                class="commenter text-uppercase font-weight-bold">${cd.commenterName}</span>
                        </a>
                        <span class="posted-on font-italic font-weight-lighter">${cd.postedOn}</span>
                        <div class="drop">
                            <button class="user-info btn drop-btn overflow-auto">
                                <i class="fa fa-comment-dots"> </i>
                            </button>
                            <div class="drop-menu">
                            <a class="btn" onclick="prepareEdit(this)" data-type="comment" data-id="${cd.id}" data-value="${cd.comment}" data-toggle="modal" data-target="#editModal">edit</a>
                            <form>
                                    <input type="text" value="comment" name="type" hidden>
                                    <input type="text" value="${cd.id}" name="commentID" hidden>
                                    <button type="button" onclick="deleteComment(this)">delete</button>
                                 </form>
                            </div>
                        </div>
                    </div>
                    <div class="comment-body">
                        <div class="comment-text" id="${cd.id}">${cd.comment}</div>
                        <div class="options">
                            <button class="btn toggleReply" onclick="toggle2ndElement(this)"
                                id="${cd.commenterId}"><i class="fa fa-reply"></i>
                            </button>
                            <form class="likeForm">
                                <input type="text" value="comment" name="type" hidden>
                                <input type="text" value="${cd.postId}" name="postID" hidden>
                                <input type="text" value="${cd.commenterId}" name="commentID" hidden>
                                <button class="btn liker" onclick="commentLike(this)"> <i class="fa fa-heart"></i> <span
                                        class="likeNumb">0</span></button>
                            </form>
                        </div>
                        <form class="mb-3 toggleThis replyForm d-none">
                            <input type="text" value="${cd.postId}" name="postID" hidden>
                            <input type="text" value="${cd.id}" name="commentID" hidden>
                            <input type="text" value="" name="replyTo" hidden>
                            <textarea name="reply"
                                class="form-control form-control-plaintext mb-2 px-2 border border-1"></textarea>
                            <button type="button" onclick="postReply(this)" class="btn bg-norm text-light">Reply</button>
                        </form>
                        <div class="reply-box">
                        <button class="btn" onclick="toggle1stElement(this)">Replies <span class="repliesNumb">0</span> </button>
                        <div class="replies ml-3 d-none toggleThis"></div>
                        </div>
                    </div>
                </div>
                `;
                commentsContainer.querySelector('.comments').insertAdjacentHTML('afterbegin', commentDiv);
            }
        }
    } catch (err) {
        console.log(err);
    }
}

const commentLike = (button) => {
    const form = button.parentElement;
    const likeCount = button.querySelector('.likeNumb');

    const type = form.type.value.trim();
    const postID = form.postID.value.trim();
    const commentID = form.commentID.value.trim();
    $.ajax({
        url: '/like/comment',
        method: 'POST',
        dataType: "json",
        headers: {
            contentType: 'application/json',
        },
        data: {
            type,
            postID,
            commentID
        },
        success: function (data) {
            if (data.success) {
                likeCount.textContent = data.likes;
                if (data.type == 'like') {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            }
        },
        error: function (xhr, status, error) {
            console.log(status, error);
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
    });
}

const deleteComment = (button) => {
    const form = button.parentElement;
    const commentCount = document.getElementById('commentCount');

    const type = form.type.value.trim();
    const commentID = form.commentID.value.trim();

    var currentBox, repliesNumb;
    if (type == 'reply') {
        currentBox = form.parentElement.parentElement.parentElement.parentElement;
        repliesNumb = form.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.querySelector('.btn .repliesNumb')
    } else {
        currentBox = form.parentElement.parentElement.parentElement.parentElement;
    }

    if (!confirm('Do you want to delete your comment?')) return;

    $.ajax({
        url: '/comment',
        method: 'DELETE',
        dataType: "json",
        headers: {
            contentType: 'application/json',
        },
        data: {
            type,
            commentID
        },
        success: function (data) {
            console.log(data);
            if (data.unsigned) {
                alert('Please Log-in');
            }
            if (data.success) {
                commentCount.textContent = data.comments;
                currentBox.remove();
            } else {
                alert(data.message);
            }
        },
        error: function (xhr, status, error) {
            console.log(status, error);
        }
    })
}

const postReply = async (button) => {
    const form = await button.parentElement;
    const postID = await form.postID.value.trim();
    const commentID = await form.commentID.value.trim();
    const replyTo = await form.replyTo.value.trim();
    const reply = await form.reply.value.trim();
    var repliesNumb;
    var replyBox;
    if (form.parentElement.classList.contains('reply-box')) {
        replyBox = form.parentElement.querySelector('.reply-box');
        repliesNumb = form.parentElement.querySelector('.reply-box .btn .repliesNumb')
    } else {
        replyBox = form.parentElement.parentElement.parentElement.parentElement;
        repliesNumb = form.parentElement.parentElement.parentElement.parentElement.querySelector('.reply-box .btn .repliesNumb')
    }

    // console.log(replyBox, repliesNumb, form.parentElement.parentElement.parentElement.parentElement);

    if (!postID || !commentID || !replyTo || !reply) return alert('Empty field not allowed');

    try {
        const res = await fetch('/comment/reply', {
            method: 'POST',
            body: JSON.stringify({
                postID,
                commentID,
                replyTo,
                reply
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await res.json();
        if (data.unsigned) {
            alert("Please log in");
        }
        if (data.success) {
            if (data.type == 'reply') {
                repliesNumb.textContent = data.replyData.repliesCount;
                const rd = data.replyData;
                const replyDiv = `
                <div class="reply">
                    <div class="reply-head">
                        <div class="repliers">
                            <a href="/profile/${rd.replierId}" class="profile">
                                <img src="/profile/${rd.replierProfile}" alt="">
                                <div>
                                    <span
                                        class="replier text-uppercase font-weight-bold">${rd.replierName}</span>
                                </div>
                            </a>
                            <a href="/profile/${rd.repliedTo._id}" class="reply-to text-secondary text-uppercase font-weight-bold">
                            ${rd.repliedTo.username}
                            </a>
                        </div>
                        <span class="posted-on font-italic font-weight-lighter">${rd.postedOn}</span>
                            <div class="drop">
                                <button class="user-info btn drop-btn overflow-auto">
                                    <i class="fa fa-comment-dots"> </i>
                                </button>
                                <a class="btn" onclick="prepareEdit(this)" data-type="reply" data-id="${rd.id}" data-value="${rd.reply}" data-toggle="modal" data-target="#editModal">edit</a>
                                <form>
                                <input type="text" value="reply" name="type" hidden>
                                <input type="text" value="${rd.id}" name="commentID" hidden>
                                <button type="button" onclick="deleteComment(this)">delete</button>
                            </form>
                            </div>
                    </div>
                    <div class="reply-body">
                        <div class="reply-text" id="${rd.id}>${rd.reply}</div>
                        <div class="options">
                            <button id="${rd.replierId}" class="btn toggleReply" onclick="toggle2ndElement(this)"><i
                                    class="fa fa-reply"></i></button>
                            <form class="likeForm">
                                <input type="text" value="reply" name="type" hidden>
                                <input type="text" value="${rd.postId}" name="postID"hidden >
                                <input type="text" value="${rd.id}" name="commentID" hidden>
                                <button class="btn liker" onclick="commentLike(this)"> <i class="fa fa-heart"></i> <span
                                        class="likeNumb">0</span></button>
                            </form>
                        </div>
                        <form class="mb-3 toggleThis replyForm d-none">
                            <input type="text" value="${rd.postId}" name="postID" hidden>
                            <input type="text" value="${rd.commentID}" name="commentID" hidden>
                            <input type="text" value="" name="replyTo" hidden>
                            <textarea name="reply"
                                class="form-control form-control-plaintext mb-2 px-2 border border-1"></textarea>
                            <button type="button" onclick="postReply(this)" class="btn bg-norm text-light">Reply</button>
                        </form>
                    </div>
            </div>
                `;
                replyBox.querySelector('.replies').insertAdjacentHTML('beforeend', replyDiv);
            }
        }
    } catch (err) {
        console.log(err);
    }
}

const prepareEdit = async (button) => {
    const type = button.getAttribute('data-type').trim();
    const commentID = button.getAttribute('data-id').trim();
    const comment = button.getAttribute('data-value').trim();
    const editForm = document.querySelector('#editModal .modal-dialog .modal-content .modal-body form');

    editForm.type.value = type;
    editForm.commentID.value = commentID;
    editForm.comment.value = comment;
}

const editComment = (button) => {
    const form = button.parentElement;
    const type = editForm.type.value;
    const commentID = editForm.commentID.value;
    const comment = editForm.comment.value;

    if (!comment) return alert('A field is empty');

    const textDiv = document.getElementById(commentID);
    $.ajax({
        url: '/comment',
        method: 'PUT',
        dataType: "json",
        headers: {
            contentType: 'application/json',
        },
        data: {
            type,
            commentID,
            comment
        },
        success: function (data) {
            console.log(data);
            if (data.unsigned) {
                alert('Please Log-in');
            }
            if (data.success) {
                alert('Your post has been updated');
                textDiv.textContent = data.newComment;
            }
        },
        error: function (xhr, status, error) {
            console.log(status, error);
        }
    });
}

const deletePost = (btn)=>{
    const parentContainer = btn.parentElement.parentElement.parentElement;
    const form = btn.parentElement;
    const postID = form.postId.value;
    
    if(!confirm('This post an every other documents(Comments, Likes, Replies) will be deleted?')) return;

    $.ajax({
        url: '/post',
        method: 'DELETE',
        dataType: "json",
        headers: {
            contentType: 'application/json',
        },
        data: {
            postID
        },
        success: function (data) {
            console.log(data);
            alert(data.message);
            if (data.unsigned) {
            }
            if (data.success) {
                parentContainer.remove();
            }
        },
        error: function (xhr, status, error) {
            console.log(status, error);
        }
    });
}
// FilePond.registerPlugin(
//     FilePondPluginImagePreview,
//     FilePondPluginImageResize,
//     FilePondPluginFileEncode,
// )

// FilePond.parse(document.body)
document.addEventListener('DOMContentLoaded', function() {
    FilePond.registerPlugin(FilePondPluginImagePreview);
    FilePond.registerPlugin(FilePondPluginImageResize);
    FilePond.registerPlugin(FilePondPluginFileEncode);
    const inputElement = document.querySelector('input[type="file"]');
    const pond = FilePond.create(inputElement);
    FilePond.parse(document.body);
  });  
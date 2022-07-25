// frontMatter.js

// Detect file line ending type

function getLineEndingType(data) {
  const indexOfLF = data.indexOf('\n', 1);
  
  if (indexOfLF === -1) {
    if (data.indexOf('\r') !== -1) {
      return '\r';
    }
    
    return '\n';
  }
  
  if (data[indexOfLF - 1] === '\r') {
    return '\r\n';
  }
  
  return '\n';
}

// Usage: frontMatter = getFrontMatter(data, format);
// where format = 'markdown' or 'HTML'
function getFrontMatter(data, format) {
  // 
  if (data == "") {
    return data;
  }

  var frontMatter = '';


  if (format == 'markdown') {
    // YAML front matter (---)
    if (data.match(/^((---)(?:\r\n|\n))/) != null) {
      /*
      var frontMatter = data.match(/^(---(?:\r\n|\n))(.|(?:\r\n|\n))*((?:\r\n|\n)---(?:\r\n|\n))$/m); // For some reason this returns phantom extra chars at the end
      */
      frontMatter = data.match(/^(---(?:\r\n|\n))(.|(?:\r\n|\n))*((?:\r\n|\n)---(?:\r\n|\n))$/gm)[0]; // And this fixes it (only take first match)
      
      // TOML front matter (+++)
    } else if (data.match(/^((\+\+\+)(?:\r\n|\n))/) != null) {
      /*
      var frontMatter = data.match(/^(\+\+\+(?:\r\n|\n))(.|(?:\r\n|\n))*((?:\r\n|\n)\+\+\+(?:\r\n|\n))$/m); // Phantom extra chars
      */
      frontMatter = data.match(/^(\+\+\+(?:\r\n|\n))(.|(?:\r\n|\n))*((?:\r\n|\n)\+\+\+(?:\r\n|\n))$/gm)[0]; // Fix
    }
    
    
  } else if (format == 'html') {
    // YAML front matter (---)
    if (data.match(/^((<pre><code>---)(?:\r\n|\n))/) != null) {
      /*
      var frontMatter = data.match(/^(<pre><code>---(?:\r\n|\n))(.|(?:\r\n|\n))*((?:\r\n|\n)---(?:\r\n|\n)<\/code><\/pre>)$/m); // Phantom extra chars
      */
      frontMatter = data.match(/^(<pre><code>---(?:\r\n|\n))(.|(?:\r\n|\n))*((?:\r\n|\n)---(?:\r\n|\n)<\/code><\/pre>)$/gm)[0]; // Fix
      
      // TOML front matter (+++)
    } else if (data.match(/^((<pre><code>\+\+\+)(?:\r\n|\n))/) != null) {
      /*
      var frontMatter = data.match(/^(<pre><code>\+\+\+(?:\r\n|\n))(.|(?:\r\n|\n))*((?:\r\n|\n)\+\+\+(?:\r\n|\n)<\/code><\/pre>)$/m); // Phantom extra chars
      */
      frontMatter = data.match(/^(<pre><code>\+\+\+(?:\r\n|\n))(.|(?:\r\n|\n))*((?:\r\n|\n)\+\+\+(?:\r\n|\n)<\/code><\/pre>)$/gm)[0]; // Fix
    }
  }

  return frontMatter;
}

// Usage: data = removeFrontMatter(data, format);
// where format = 'markdown' or 'HTML'
function removeFrontMatter(data, format) {
  // 
  if (data == "") {
    return data;
  }


  if (format == 'markdown') {
    // YAML front matter (---)
    if (data.match(/^((---)(?:\r\n|\n))/) != null) {
      data = data.replace(/^(---(?:\r\n|\n))(.|(?:\r\n|\n))*((?:\r\n|\n)---(?:\r\n|\n))$/m, function (match) {
        return '';
      });
      
      // TOML front matter (+++)
    } else if (data.match(/^((\+\+\+)(?:\r\n|\n))/) != null) {
      data = data.replace(/^(\+\+\+(?:\r\n|\n))(.|(?:\r\n|\n))*((?:\r\n|\n)\+\+\+(?:\r\n|\n))$/m, function (match) {
        return '';
      });
    }
    
    
  } else if (format == 'html') {
    // YAML front matter (---)
    if (data.match(/^((<pre><code>---)(?:\r\n|\n))/) != null) {
      data = data.replace(/^(<pre><code>---(?:\r\n|\n))(.|(?:\r\n|\n))*((?:\r\n|\n)---(?:\r\n|\n)<\/code><\/pre>)$/m, function (match) {
        return '';
      });
      
      // TOML front matter (+++)
    } else if (data.match(/^((<pre><code>\+\+\+)(?:\r\n|\n))/) != null) {
      data = data.replace(/^(<pre><code>\+\+\+(?:\r\n|\n))(.|(?:\r\n|\n))*((?:\r\n|\n)\+\+\+(?:\r\n|\n)<\/code><\/pre>)$/m, function (match) {
        return '';
      });
    }
  }

  return data;
}

// Usage: data = addFrontMatter(data, frontMatter, format);
// where format = 'markdown' or 'HTML'
function addFrontMatter(data, frontMatter, format) {
  // 
  if (frontMatter == "") {
    return data;
  }

  // Get the correct line ending type
  var lineEndingType = getLineEndingType(data);


  if (format == 'markdown') {
    data = frontMatter + lineEndingType + data;
    
  } else if (format == 'html') {
    data = '<pre><code>' + frontMatter + '</code></pre>' + lineEndingType + data;
  }

  return data;
}
